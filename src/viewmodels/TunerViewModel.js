import { useEffect, useState, useRef, useCallback } from "react";
import { hpsPitchDetection } from "../utils/hpsPitchDetection";
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
  // Thời gian người dùng giữ đúng tông
  const inTuneSinceRef = useRef(null);

  // Thời gian yêu cầu phải giữ đúng tông để phát beep (ms)
  const IN_TUNE_REQUIRED_MS = 3000; // 3 giây

  // Thời lượng tiếng beep phát ra (s)
  const BEEP_DURATION = 0.3;

  const stop = useCallback(() => {
    inTuneSinceRef.current = null;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => { });
      audioContextRef.current = null;
    }
    setIsRunning(false);
  }, []);
  function playBeep() {
    console.log("🔊 playBeep được gọi!");

    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880; // tần số beep (A5 - nghe rõ ràng)

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime); // volume nhỏ
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + BEEP_DURATION);
  }

  function normalizePitch(freq) {
    let pitch = freq;
    while (pitch > 500) pitch /= 2;
    return pitch;
  }

  function normalizeToNearestOctave(freq, target) {
    let f = freq;
    if (!target || !isFinite(target) || target <= 0) return f;
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

    // RMS
    let r = 0;
    const buf = bufferRef.current;
    for (let i = 0; i < buf.length; i++) r += buf[i] * buf[i];
    r = Math.sqrt(r / buf.length);
    setRms(r);

    const ctx = audioContextRef.current;
    const pitchResult = hpsPitchDetection(buf, ctx.sampleRate);

    if (pitchResult && pitchResult.freq) {
      let pitch = normalizePitch(pitchResult.freq);
      const confidence = pitchResult.confidence || 0.5;

      const MAX_HISTORY = 8;
      const MIN_CONFIDENCE = 0.4; // >= 60%
      if (confidence >= MIN_CONFIDENCE) {
        pitchHistory.current.push(pitch);
        confidenceHistory.current.push(confidence);
      }

      if (pitchHistory.current.length > MAX_HISTORY) {
        pitchHistory.current.shift();
        confidenceHistory.current.shift();
      }

      if (pitchHistory.current.length >= 3) {
        let weightedSum = 0;
        let totalWeight = 0;
        for (let i = 0; i < pitchHistory.current.length; i++) {
          const weight = confidenceHistory.current[i] || 0.1;
          weightedSum += pitchHistory.current[i] * weight;
          totalWeight += weight;
        }
        const smoothed = weightedSum / totalWeight;

        // throttle log
        const nowLog = performance.now();
        if (nowLog - lastLogAtRef.current > 100) {
          lastLogAtRef.current = nowLog;
        }

        const STABILITY_THRESHOLD = 2.0;
        const MIN_STABLE_COUNT = 2;
        if (
          !lastPitchRef.current ||
          Math.abs(lastPitchRef.current - smoothed) > STABILITY_THRESHOLD
        ) {
          stableCountRef.current = 0;
          lastPitchRef.current = smoothed;
        } else {
          stableCountRef.current++;
        }

        if (stableCountRef.current >= MIN_STABLE_COUNT) {
          if (smoothed >= 70 && smoothed <= 500) {
            if (tunerMode === "auto") {
              const { note, targetFreq, cents } = findClosestNote(smoothed);

              const HYSTERESIS_CENTS = 20;
              const lastNote = currentNoteRef.current;
              let finalNote = note;
              let finalTarget = targetFreq;
              let finalCents = cents;

              if (lastNote && lastNote !== note && Math.abs(cents) < HYSTERESIS_CENTS) {
                finalNote = lastNote;
                finalTarget = getTargetFrequency(lastNote) || targetFreq;
                finalCents = 1200 * Math.log2(smoothed / finalTarget);
              }

              const DEADZONE_CENTS = 10;
              if (Math.abs(finalCents) < DEADZONE_CENTS) {
                finalCents = 0;

                // 🕒 Nếu bắt đầu đúng tông → lưu thời điểm
                if (!inTuneSinceRef.current) {
                  inTuneSinceRef.current = performance.now();
                } else {
                  const elapsed = performance.now() - inTuneSinceRef.current;
                  if (elapsed >= IN_TUNE_REQUIRED_MS) {
                    playBeep();
                    inTuneSinceRef.current = null; // reset để không kêu liên tục
                  }
                }
              } else {
                // ❌ lệch tông → reset bộ đếm
                inTuneSinceRef.current = null;
              }


              const now = performance.now();
              if (now - lastUiUpdateAtRef.current > 50) {
                lastUiUpdateAtRef.current = now;
                setNoteData({
                  pitch: smoothed,
                  note: finalNote,
                  cents: finalCents,
                  targetFreq: finalTarget,
                  confidence,
                  isStable: true,
                });
                currentNoteRef.current = finalNote;
              }
            } else {
              const targetFreq = getTargetFrequency(selectedString);
              const aligned = normalizeToNearestOctave(smoothed, targetFreq);
              let cents = 1200 * Math.log2(aligned / targetFreq);

              const DEADZONE_CENTS = 6;
              if (Math.abs(cents) < DEADZONE_CENTS) {
                cents = 0;

                // Manual mode cũng áp dụng đếm 3 giây
                if (!inTuneSinceRef.current) {
                  inTuneSinceRef.current = performance.now();
                } else {
                  const elapsed = performance.now() - inTuneSinceRef.current;
                  if (elapsed >= IN_TUNE_REQUIRED_MS) {
                    playBeep();
                    inTuneSinceRef.current = null;
                  }
                }
              } else {
                inTuneSinceRef.current = null;
              }


              const now = performance.now();
              if (now - lastUiUpdateAtRef.current > 50) {
                lastUiUpdateAtRef.current = now;
                setNoteData({
                  pitch: smoothed,
                  note: selectedString,
                  cents,
                  targetFreq,
                  confidence,
                  isStable: true,
                });
                currentNoteRef.current = selectedString;
              }
            }
            lastStablePitchRef.current = smoothed;
          }
        }
      }
    } else {
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
          sampleRate: 44100,
          sampleSize: 16,
        },
      });

      mediaStreamRef.current = stream;
      const source = ctx.createMediaStreamSource(stream);

      const gain = ctx.createGain();
      gain.gain.value = 1.8;

      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 80;
      hp.Q.value = 0.707;

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
      lp.frequency.value = 550;
      lp.Q.value = 0.707;

      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 200;
      band.Q.value = 1.2;

      const analyser = ctx.createAnalyser();
      analyser.smoothingTimeConstant = 0.1;
      analyser.fftSize = 32768;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      analyserRef.current = analyser;
      bufferRef.current = new Float32Array(analyser.fftSize);

      pitchHistory.current = [];
      confidenceHistory.current = [];
      lastPitchRef.current = null;
      stableCountRef.current = 0;
      lastStablePitchRef.current = null;
      lastUiUpdateAtRef.current = 0;

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
      pitchHistory.current = [];
      confidenceHistory.current = [];
      lastPitchRef.current = null;
      stableCountRef.current = 0;
      lastStablePitchRef.current = null;
      lastUiUpdateAtRef.current = 0;
      currentNoteRef.current = mode === "manual" ? selectedString : null;

      if (bandFilterRef.current) {
        if (mode === "auto") {
          bandFilterRef.current.frequency.value = 200;
          bandFilterRef.current.Q.value = 0.8;
        } else {
          const tf = getTargetFrequency(selectedString);
          bandFilterRef.current.frequency.value = tf || 200;
          bandFilterRef.current.Q.value = 5;
        }
      }
      setTunerMode(mode);
    },
    selectedString,
    setSelectedString: (s) => {
      // 🔄 Reset toàn bộ state
       inTuneSinceRef.current = null; 
      pitchHistory.current = [];
      confidenceHistory.current = [];
      lastPitchRef.current = null;
      stableCountRef.current = 0;
      lastStablePitchRef.current = null;
      lastUiUpdateAtRef.current = 0;
      currentNoteRef.current = s;

      // 🎯 Điều chỉnh bandpass filter về dây mới
      if (bandFilterRef.current && tunerMode === "manual") {
        const tf = getTargetFrequency(s);
        bandFilterRef.current.frequency.value = tf || 200;
        bandFilterRef.current.Q.value = 5;
      }

      // 🧠 Restart loop để tránh dùng lại dữ liệu cũ
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(loop);

      // ✅ Cập nhật state react
      setSelectedString(s);
    },

  };
}
