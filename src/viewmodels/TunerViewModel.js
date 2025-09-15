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
  const hpFilterRef = useRef(null);
  const lpFilterRef = useRef(null);
  const bandFilterRef = useRef(null);
  const preGainRef = useRef(null);
  const notch50Ref = useRef(null);
  const notch100Ref = useRef(null);
  const rafIdRef = useRef(null);
  const pitchHistory = useRef([]);
  const confidenceHistory = useRef([]);
  const lastPitchRef = useRef(null);
  const stableCountRef = useRef(0);
  const lastStablePitchRef = useRef(null);
  const lastUiUpdateAtRef = useRef(0);
  const currentNoteRef = useRef(null);
  const lastLogAtRef = useRef(0);

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

  // Đưa tần số về OCTAVE gần target nhất (giảm sai chiều khi cách > 1 octave)
  function normalizeToNearestOctave(freq, target) {
    let f = freq;
    if (!target || !isFinite(target) || target <= 0) return f;
    // Kéo f về sao cho |f - target| là nhỏ nhất khi nhân/chia 2
    let improved = true;
    while (improved) {
      improved = false;
      if (Math.abs(f * 2 - target) < Math.abs(f - target)) {
        f *= 2;
        improved = true;
        continue;
      }
      if (Math.abs(f / 2 - target) < Math.abs(f - target)) {
        f /= 2;
        improved = true;
      }
    }
    return f;
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
      const MIN_CONFIDENCE = 0.4; // Chỉ nhận kết quả có confidence >= 60%
      
      // Chỉ dùng khi đủ tin cậy
      if (confidence >= MIN_CONFIDENCE) {
        pitchHistory.current.push(pitch);
        confidenceHistory.current.push(confidence);
      }
      
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

        // Log tần số đang thu (throttled)
        const nowLog = performance.now();
        if (nowLog - lastLogAtRef.current > 100) { // ~10 lần/giây
          lastLogAtRef.current = nowLog;
          console.log(
            `🎙️ Captured: ${pitchResult.freq.toFixed(2)} Hz | Smoothed: ${smoothed.toFixed(2)} Hz`
          );
        }

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
              const DEADZONE_CENTS = 10;
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
              const aligned = normalizeToNearestOctave(smoothed, targetFreq);
              let cents = 1200 * Math.log2(aligned / targetFreq);

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
      // Audio pre-filter chain to improve SNR
      const gain = ctx.createGain();
      gain.gain.value = 1.8; // nhẹ nhàng nâng tín hiệu

      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 80; // cut rumble mạnh hơn
      hp.Q.value = 0.707;

      // Notch 50Hz và 100Hz để loại nhiễu điện lưới
      const notch50 = ctx.createBiquadFilter();
      notch50.type = "notch";
      notch50.frequency.value = 50;
      notch50.Q.value = 12;

      const notch100 = ctx.createBiquadFilter();
      notch100.type = "notch";
      notch100.frequency.value = 100;
      notch100.Q.value = 12;

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 550; // limit to guitar band
      lp.Q.value = 0.707;

      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 200; // broad in auto; will retune in manual
      band.Q.value = 1.2;

      const analyser = ctx.createAnalyser();
      analyser.smoothingTimeConstant = 0.1; // Một chút smoothing để giảm nhiễu
      analyser.fftSize = 32768; // Tăng fftSize để detect fundamental tốt hơn
      analyser.minDecibels = -90; // Giảm ngưỡng để bắt âm thanh yếu hơn
      analyser.maxDecibels = -10; // Giảm max để tránh clipping
      analyserRef.current = analyser;
      bufferRef.current = new Float32Array(analyser.fftSize);

      // Reset bộ nhớ lọc/stability khi bắt đầu lần mới
      pitchHistory.current = [];
      confidenceHistory.current = [];
      lastPitchRef.current = null;
      stableCountRef.current = 0;
      lastStablePitchRef.current = null;
      lastUiUpdateAtRef.current = 0;

      // Wire graph: source -> HPF -> LPF -> Bandpass -> Analyser
      preGainRef.current = gain;
      hpFilterRef.current = hp;
      lpFilterRef.current = lp;
      bandFilterRef.current = band;
      notch50Ref.current = notch50;
      notch100Ref.current = notch100;

      source.connect(gain);
      gain.connect(hp);
      hp.connect(notch50);
      notch50.connect(notch100);
      notch100.connect(lp);
      lp.connect(band);
      band.connect(analyser);
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
    setTunerMode: (mode) => {
      // Khi đổi chế độ, reset bộ lọc để tránh kẹt trạng thái cũ
      pitchHistory.current = [];
      confidenceHistory.current = [];
      lastPitchRef.current = null;
      stableCountRef.current = 0;
      lastStablePitchRef.current = null;
      lastUiUpdateAtRef.current = 0;

      // Auto: bandpass rộng; Manual: retune theo dây
      if (bandFilterRef.current) {
        if (mode === "auto") {
          bandFilterRef.current.frequency.value = 200;
          bandFilterRef.current.Q.value = 0.8;
        } else {
          const tf = getTargetFrequency(selectedString);
          bandFilterRef.current.frequency.value = tf || 200;
          bandFilterRef.current.Q.value = 5; // narrow band for stability
        }
      }
      setTunerMode(mode);
    },
    selectedString,
    setSelectedString: (s) => {
      // Khi đổi dây, cũng reset smoothing
      pitchHistory.current = [];
      confidenceHistory.current = [];
      lastPitchRef.current = null;
      stableCountRef.current = 0;
      lastStablePitchRef.current = null;
      lastUiUpdateAtRef.current = 0;
      if (bandFilterRef.current && tunerMode === "manual") {
        const tf = getTargetFrequency(s);
        bandFilterRef.current.frequency.value = tf || 200;
        bandFilterRef.current.Q.value = 5;
      }
      setSelectedString(s);
    }
  };
}
