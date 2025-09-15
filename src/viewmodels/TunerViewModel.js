import { useEffect, useState, useRef, useCallback } from "react";
import { detectPitch } from "../utils/pitchDetection";
import { findClosestNote } from "../models/NoteModel";

export function useTunerViewModel() {
  const [noteData, setNoteData] = useState(null);
  const [rms, setRms] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [tunerMode, setTunerMode] = useState("auto"); // "auto" hoặc "manual"
  const [selectedString, setSelectedString] = useState("E2");

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const bufferRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const rafIdRef = useRef(null);
  const pitchHistory = useRef([]);
  const confidenceHistory = useRef([]);
  const lastPitchRef = useRef(null);
  const stableCountRef = useRef(0);
  const lastStablePitchRef = useRef(null);
  const lastUiUpdateAtRef = useRef(0);
  const currentNoteRef = useRef(null);

  // Dừng micro + dọn dẹp
  const stop = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Hàm normalize pitch → chia 2, chia 3 nếu cần
  function normalizePitch(freq) {
    let pitch = freq;
    // nếu pitch cao hơn 500Hz → có thể là harmonic
    while (pitch > 500) pitch = pitch / 2;
    return pitch;
  }

  // Hàm lấy tần số target của dây đàn
  const getTargetFrequency = useCallback((note) => {
    const FREQUENCIES = {
      E2: 82.41,
      A2: 110.0,
      D3: 146.83,
      G3: 196.0,
      B3: 246.94,
      E4: 329.63,
    };
    return FREQUENCIES[note] || 0;
  }, []);

  const loop = useCallback(() => {
    if (!analyserRef.current || !bufferRef.current) return;
    analyserRef.current.getFloatTimeDomainData(bufferRef.current);

    // 1️⃣ RMS
    let r = 0;
    const buf = bufferRef.current;
    for (let i = 0; i < buf.length; i++) r += buf[i] * buf[i];
    r = Math.sqrt(r / buf.length);
    setRms(r);

    // 2️⃣ Phát hiện pitch với confidence score
    const ctx = audioContextRef.current;
    const pitchResult = detectPitch(buf, ctx.sampleRate);

    if (pitchResult && pitchResult.freq) {
      let pitch = normalizePitch(pitchResult.freq);
      const confidence = pitchResult.confidence || 0.5; // Default confidence nếu không có
      const signalRms = pitchResult.rms || 0;

      console.log(
        `🎵 Raw pitch: ${pitchResult.freq.toFixed(2)} Hz → Normalized: ${pitch.toFixed(2)} Hz | Confidence: ${(confidence * 100).toFixed(1)}% | RMS: ${signalRms.toFixed(4)}`
      );

      // 3️⃣ Enhanced smoothing với confidence weighting
      const MAX_HISTORY = 8; // Tăng history để smoothing tốt hơn
      const MIN_CONFIDENCE = 0.1; // Giảm ngưỡng confidence để dễ detect hơn
      
      // Thêm vào history (luôn thêm để đảm bảo hoạt động)
      pitchHistory.current.push(pitch);
      confidenceHistory.current.push(confidence);
      
      if (pitchHistory.current.length > MAX_HISTORY) {
        pitchHistory.current.shift();
        confidenceHistory.current.shift();
      }

      // Weighted average dựa trên confidence
      if (pitchHistory.current.length >= 3) {
        let weightedSum = 0;
        let totalWeight = 0;
        
        for (let i = 0; i < pitchHistory.current.length; i++) {
          const weight = confidenceHistory.current[i] || 0.1;
          weightedSum += pitchHistory.current[i] * weight;
          totalWeight += weight;
        }
        
        const smoothed = weightedSum / totalWeight;

        // 4️⃣ Stability check - chỉ cập nhật khi pitch ổn định
        const STABILITY_THRESHOLD = 2.0; // Hz - tăng để dễ ổn định hơn
        const MIN_STABLE_COUNT = 2; // Giảm xuống 2 lần để phản hồi nhanh hơn
        
        if (!lastPitchRef.current || Math.abs(lastPitchRef.current - smoothed) > STABILITY_THRESHOLD) {
          stableCountRef.current = 0;
          lastPitchRef.current = smoothed;
        } else {
          stableCountRef.current++;
        }

        // Chỉ cập nhật UI khi pitch đã ổn định (bỏ điều kiện confidence)
        if (stableCountRef.current >= MIN_STABLE_COUNT) {
          if (smoothed >= 70 && smoothed <= 500) {
            if (tunerMode === "auto") {
              // Chế độ tự động: detect note gần nhất
              const { note, targetFreq, cents } = findClosestNote(smoothed);

              // Hysteresis tránh nhảy note khi sát biên
              const HYSTERESIS_CENTS = 20; // ~1/5 semitone
              const lastNote = currentNoteRef.current;
              let finalNote = note;
              let finalTarget = targetFreq;
              let finalCents = cents;
              if (lastNote && lastNote !== note && noteData?.note === lastNote && Math.abs(cents) < HYSTERESIS_CENTS) {
                finalNote = noteData.note;
                finalTarget = noteData.targetFreq;
                finalCents = 1200 * Math.log2(smoothed / finalTarget);
              }

              // Deadzone để giảm rung
              const DEADZONE_CENTS = 6;
              if (Math.abs(finalCents) < DEADZONE_CENTS) finalCents = 0;

              console.log(
                `🎯 Auto Mode - Stable: ${smoothed.toFixed(2)} Hz | Note: ${finalNote} | Δ: ${finalCents.toFixed(1)} cents | Conf: ${(confidence * 100).toFixed(1)}%`
              );

              // Throttle cập nhật UI ~20fps
              const now = performance.now();
              if (now - lastUiUpdateAtRef.current > 50) {
                lastUiUpdateAtRef.current = now;
                setNoteData({ 
                  pitch: smoothed, 
                  note: finalNote, 
                  cents: finalCents, 
                  targetFreq: finalTarget, 
                  confidence,
                  isStable: true 
                });
                currentNoteRef.current = finalNote;
              }
            } else {
              // Chế độ manual: so sánh với dây đã chọn
              const targetFreq = getTargetFrequency(selectedString);
              let cents = 1200 * Math.log2(smoothed / targetFreq);

              // Gate: chỉ cập nhật khi nằm trong ±150 cents quanh dây chọn
              const MANUAL_GATE_CENTS = 150;
              if (Math.abs(cents) > MANUAL_GATE_CENTS) {
                return;
              }

              // Deadzone để giảm rung
              const DEADZONE_CENTS = 6;
              if (Math.abs(cents) < DEADZONE_CENTS) cents = 0;

              console.log(
                `🎯 Manual Mode - Stable: ${smoothed.toFixed(2)} Hz | Target: ${selectedString} (${targetFreq} Hz) | Δ: ${cents.toFixed(1)} cents | Conf: ${(confidence * 100).toFixed(1)}%`
              );

              const now = performance.now();
              if (now - lastUiUpdateAtRef.current > 50) {
                lastUiUpdateAtRef.current = now;
                setNoteData({ 
                  pitch: smoothed, 
                  note: selectedString, 
                  cents, 
                  targetFreq, 
                  confidence,
                  isStable: true 
                });
              }
            }
            lastStablePitchRef.current = smoothed;
          }
        }
      }
    } else {
      // Không có pitch detected - reset stability counter
      stableCountRef.current = 0;
    }

    rafIdRef.current = requestAnimationFrame(loop);
  }, [tunerMode, selectedString, getTargetFrequency]);

  const start = useCallback(async () => {
    try {
      setError("");
      stop();

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === "suspended") await ctx.resume();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 44100, // Tăng sample rate để độ chính xác cao hơn
          sampleSize: 16,
        },
      });

      mediaStreamRef.current = stream;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.smoothingTimeConstant = 0.1; // Một chút smoothing để giảm nhiễu
      analyser.fftSize = 32768; // Tăng fftSize để detect fundamental tốt hơn
      analyser.minDecibels = -90; // Giảm ngưỡng để bắt âm thanh yếu hơn
      analyser.maxDecibels = -10; // Giảm max để tránh clipping
      analyserRef.current = analyser;
      bufferRef.current = new Float32Array(analyser.fftSize);

      source.connect(analyser);
      setIsRunning(true);
      rafIdRef.current = requestAnimationFrame(loop);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Không thể truy cập micro");
      stop();
    }
  }, [loop, stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { 
    noteData, 
    rms, 
    isRunning, 
    error, 
    start, 
    stop,
    tunerMode,
    setTunerMode,
    selectedString,
    setSelectedString
  };
}
