import { useCallback, useEffect, useRef, useState } from "react";
import { toneChords } from "../data/toneChords";

/**
 * ViewModel luyện tập hợp âm theo nhịp với mic detection (onset-based)
 * - Phát hiện cú đánh (strum) bằng năng lượng RMS vượt ngưỡng + hysteresis
 * - Lên lịch các slot cần đánh theo BPM, timeSignature, subdivision, pattern
 * - Chấm điểm so sánh timestamp onset với slot gần nhất trong ngưỡng
 */
export default function useRhythmPracticeVM() {
  const PROGRESSION_PRESETS = ["I-V-vi-IV", "I-IV-V-I", "vi-IV-I-V"]; // bộ tiêu chuẩn
  const COMPLETION_THRESHOLD = 60; // % tối thiểu để coi là hoàn tất một tiến trình
  const CHORD_TARGET = 20; // tổng số hợp âm cần đánh trong một vòng
  const [isRunning, setIsRunning] = useState(false);
  const [bpm, setBpm] = useState(90);
  const [timeSig, setTimeSig] = useState(4); // beats per bar
  const [subdivision, setSubdivision] = useState(8); // 8 or 16
  const [selectedTone, setSelectedTone] = useState("C / Am");
  const [progressionPreset, setProgressionPreset] = useState("I-V-vi-IV");
  const [patternText, setPatternText] = useState("X - X L - L X - L"); // 8th grid template (X: xuống, L: lên)
  const [barsPerLoop, setBarsPerLoop] = useState(4);
  const [clickEnabled, setClickEnabled] = useState(false);
  const [clickVolume, setClickVolume] = useState(0.15);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownMsLeft, setCountdownMsLeft] = useState(0);

  const [currentBarIndex, setCurrentBarIndex] = useState(0);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [currentChord, setCurrentChord] = useState("");
  const [nextChord, setNextChord] = useState("");

  const [hitsTotal, setHitsTotal] = useState(0);
  const [hitsCorrect, setHitsCorrect] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const hitsCorrectRef = useRef(0);
  const missCountRef = useRef(0);
  const attemptsRef = useRef(0);

  // Audio + analyser
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const rafIdRef = useRef(null);

  // Detection state
  const lastOnsetTimeRef = useRef(0);
  const onsetCooldownMsRef = useRef(120);
  const energyThresholdRef = useRef(0.08); // RMS threshold (tinh chỉnh trong UI nếu cần)
  const energyReleaseRef = useRef(0.05);
  const isAboveRef = useRef(false);
  const windowMsRef = useRef(120); // dung sai cố định ±120ms

  // Scheduling
  const scheduledSlotsRef = useRef([]); // [{time, bar, indexInBar, required: true, dir: 'D'|'U'}]
  const matchedSlotIdsRef = useRef(new Set());
  const countedAttemptIdsRef = useRef(new Set());
  const barStartTimeRef = useRef(0);
  const beatDurationRef = useRef(60 / bpm);
  const loopBarsRef = useRef(barsPerLoop);
  // Click scheduler
  const clickScheduleTimerRef = useRef(null);
  const clickNextTimeRef = useRef(0);
  const clickBeatCountRef = useRef(0);
  // Cycle tracking
  const lastSlotTimeRef = useRef(0);
  const cycleFinalizedRef = useRef(false);
  const hitsTotalRef = useRef(0);
  const stopRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const countdownEndTimeRef = useRef(0);
  const lastCountedBarIndexRef = useRef(0);

  // Progress persistence
  const [progressMap, setProgressMap] = useState({}); // { tone: { progression: bestAccuracy } }
  const STORAGE_KEY = 'rhythmPracticeProgress_v1';
  const [passNotice, setPassNotice] = useState(null); // { tone, progression, accuracy }

  // Utilities
  const getToneChords = useCallback(() => {
    return toneChords[selectedTone] || [];
  }, [selectedTone]);

  const computeProgression = useCallback(() => {
    // Map preset roman numerals to indexes in toneChords (major degrees):
    // toneChords: [I, ii, iii, IV, V, vi, vii°]
    const degreeMap = { I: 0, ii: 1, iii: 2, IV: 3, V: 4, vi: 5, "vii°": 6, vii: 6 };
    const chords = getToneChords();
    const tokens = progressionPreset.split("-");
    const result = tokens
      .map((t) => t.trim())
      .map((deg) => chords[degreeMap[deg]] || chords[0])
      .filter(Boolean);
    // ensure barsPerLoop matches length
    return result.length > 0 ? result : [chords[0]];
  }, [getToneChords, progressionPreset]);

  // Load & Save progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProgressMap(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
    } catch {}
  }, [progressMap]);

  const markProgress = useCallback((tone, progression, acc) => {
    const prevBest = (progressMap[tone]?.[progression]) || 0;
    const crossed = prevBest < COMPLETION_THRESHOLD && (acc || 0) >= COMPLETION_THRESHOLD;
    setProgressMap((prev) => {
      const toneMap = { ...(prev[tone] || {}) };
      const best = Math.max(toneMap[progression] || 0, acc || 0);
      toneMap[progression] = best;
      return { ...prev, [tone]: toneMap };
    });
    if (crossed) {
      setPassNotice({ tone, progression, accuracy: acc || 0 });
    }
  }, [progressMap, COMPLETION_THRESHOLD]);

  const getToneProgress = useCallback((tone) => {
    return progressMap[tone] || {};
  }, [progressMap]);

  const parsePattern = useCallback(() => {
    // Convert pattern text into subdivision slots within one bar
    // For 8th grid (subdivision=8) we expect 8 slots per bar; tokens can be 'X','L','-' (rest)
    // Backward-compatible: 'D' -> 'X', 'U' -> 'L'
    const slotsPerBar = subdivision;
    const rawTokens = patternText
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    // Repeat or truncate to fit slotsPerBar
    const tokens = new Array(slotsPerBar).fill('-');
    for (let i = 0; i < slotsPerBar; i++) {
      tokens[i] = rawTokens[i % rawTokens.length] || '-';
    }
    return tokens.map((tok, i) => {
      let dir = null;
      if (tok === 'X' || tok === 'x' || tok === 'D' || tok === 'd') dir = 'X';
      else if (tok === 'L' || tok === 'l' || tok === 'U' || tok === 'u') dir = 'L';
      return { index: i, required: tok !== '-', dir };
    });
  }, [patternText, subdivision]);

  const scheduleLoop = useCallback((startAt) => {
    const progression = computeProgression();
    const beatDur = 60 / bpm;
    beatDurationRef.current = beatDur;
    scheduledSlotsRef.current = [];
    matchedSlotIdsRef.current = new Set();
    countedAttemptIdsRef.current = new Set();

    barStartTimeRef.current = startAt;

    // Mỗi hợp âm tương ứng 1 ô nhịp: lặp tiến trình cho đủ CHORD_TARGET hợp âm
    const barLen = timeSig * beatDur;
    let slotIdCounter = 0;
    for (let i = 0; i < CHORD_TARGET; i++) {
      const chordForBar = progression[i % progression.length];
      const absoluteTime = startAt + i * barLen; // đầu ô nhịp
      scheduledSlotsRef.current.push({
        id: slotIdCounter++,
        time: absoluteTime,
        bar: i,
        indexInBar: 0,
        chord: chordForBar,
        required: true,
        dir: 'X',
      });
    }
    // Track last slot time of this cycle
    if (scheduledSlotsRef.current.length > 0) {
      lastSlotTimeRef.current = scheduledSlotsRef.current[scheduledSlotsRef.current.length - 1].time;
    } else {
      lastSlotTimeRef.current = startAt;
    }
    // Initialize HUD chord indicators
    setCurrentChord(progression[0] || "");
    setNextChord(progression[1 % progression.length] || progression[0] || "");
    setCurrentBarIndex(0);
    setCurrentBeatIndex(0);
    const totalReq = scheduledSlotsRef.current.length;
    setHitsTotal(totalReq);
    hitsTotalRef.current = totalReq;
    setHitsCorrect(0);
    setMissCount(0);
    setAttemptsCount(0);
    attemptsRef.current = 0;
    cycleFinalizedRef.current = false;

    // Phách đầu tiên luôn đúng và được tính là đã đánh
    if (totalReq > 0) {
      const firstId = scheduledSlotsRef.current[0].id;
      matchedSlotIdsRef.current.add(firstId);
      countedAttemptIdsRef.current.add(firstId);
      setHitsCorrect(1);
      hitsCorrectRef.current = 1;
      setAttemptsCount(1);
      attemptsRef.current = 1;
      lastCountedBarIndexRef.current = 0;
    }
  }, [bpm, timeSig, computeProgression]);

  const updateHudByTime = useCallback((now) => {
    const beatDur = beatDurationRef.current;
    const rel = now - barStartTimeRef.current;
    if (rel < 0) return;
    const barLen = timeSig * beatDur;
    const barFloat = rel / barLen; // e.g. 0.2 bar
    const barIndex = Math.floor(barFloat);
    const withinBar = rel - barIndex * barLen;
    const beatIndex = Math.floor(withinBar / beatDur);
    setCurrentBarIndex((prev) => (prev !== barIndex ? barIndex : prev));
    setCurrentBeatIndex((prev) => (prev !== beatIndex ? beatIndex : prev));
    // chord update
    const slots = scheduledSlotsRef.current;
    if (slots.length > 0) {
      const any = slots.find((s) => s.bar === barIndex);
      const next = slots.find((s) => s.bar === barIndex + 1);
      if (any) setCurrentChord(any.chord);
      if (next) setNextChord(next.chord);
    }
  }, [timeSig]);

  const processOnset = useCallback((now) => {
    const windowSec = Math.max(0, windowMsRef.current) / 1000; // dung sai ±ms
    const slots = scheduledSlotsRef.current.filter((s) => s.required);
    let best = null;
    let bestAbs = Infinity;
    for (const s of slots) {
      // Bỏ qua các phách đã chốt (đã tính đúng hoặc đã chốt sai)
      if (matchedSlotIdsRef.current.has(s.id)) continue;
      if (countedAttemptIdsRef.current.has(s.id)) continue;
      const dt = now - s.time;
      const abs = Math.abs(dt);
      if (abs < bestAbs) {
        bestAbs = abs;
        best = { slot: s, dt };
      }
    }
    if (!best) return;
    if (bestAbs <= windowSec) {
      matchedSlotIdsRef.current.add(best.slot.id);
      setHitsCorrect((v) => v + 1);
    } else {
      // Không tăng sai ở đây; sai sẽ được tính theo phách khi hết ô nhịp
    }
  }, []);

  const loopDetect = useCallback(() => {
    if (!audioContextRef.current || !analyserRef.current) return;
    const analyser = analyserRef.current;
    const bufferLen = analyser.fftSize;
    const timeData = new Float32Array(bufferLen);
    analyser.getFloatTimeDomainData(timeData);

    // Compute RMS
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = timeData[i];
      sum += v * v;
    }
    const rms = Math.sqrt(sum / timeData.length);

    const now = audioContextRef.current.currentTime;
    updateHudByTime(now);

    const passedCooldown = (now - lastOnsetTimeRef.current) * 1000 >= onsetCooldownMsRef.current;
    if (!isAboveRef.current) {
      if (rms >= energyThresholdRef.current && passedCooldown) {
        isAboveRef.current = true;
        lastOnsetTimeRef.current = now;
        processOnset(now);
      }
    } else {
      // release when energy drop below release threshold
      if (rms < energyReleaseRef.current) {
        isAboveRef.current = false;
      }
    }

    // Auto finalize when cycle finished (after last required slot + grace)
    if (!cycleFinalizedRef.current && lastSlotTimeRef.current > 0 && now > lastSlotTimeRef.current + 0.3) {
      const total = hitsTotalRef.current || 0;
      if (total > 0 && selectedTone && progressionPreset) {
        const accNow = Math.floor((hitsCorrectRef.current * 100) / total);
        try { markProgress(selectedTone, progressionPreset, accNow); } catch {}
      }
      // Đảm bảo số đã đánh và sai ăn khớp tổng
      if ((attemptsRef.current || 0) < total) {
        const remain = total - (attemptsRef.current || 0);
        attemptsRef.current += remain;
        setAttemptsCount((v) => v + remain);
        const newMiss = Math.max(0, attemptsRef.current - (hitsCorrectRef.current || 0));
        setMissCount(newMiss);
      }
      cycleFinalizedRef.current = true;
    }

    // Increase attempts after each bar (end of chord slot), independent of correct/wrong
    try {
      const beatDur = beatDurationRef.current;
      const barLen = timeSig * beatDur;
      const slots = scheduledSlotsRef.current;
      for (const s of slots) {
        if (!s.required) continue;
        if (countedAttemptIdsRef.current.has(s.id)) continue;
        if (now >= s.time + barLen) {
          countedAttemptIdsRef.current.add(s.id);
          attemptsRef.current += 1;
          setAttemptsCount((v) => v + 1);
          // Cập nhật số sai theo công thức: Sai = Đã đánh - Đúng (đảm bảo không vừa đúng vừa sai)
          const newMiss = Math.max(0, attemptsRef.current - (hitsCorrectRef.current || 0));
          setMissCount(newMiss);
        }
      }
      // Đếm ngay khi bước sang phách kế tiếp (chốt phách vừa kết thúc)
      const rel = now - barStartTimeRef.current;
      if (rel >= 0) {
        const currentBarFloat = rel / barLen;
        const currentBarIndexCalc = Math.floor(currentBarFloat);
        // Khi vừa vào bar N, chốt bar N-1
        if (currentBarIndexCalc > lastCountedBarIndexRef.current && currentBarIndexCalc <= (hitsTotalRef.current || 0)) {
          const prevBar = currentBarIndexCalc - 1;
          const prevSlot = slots.find((s) => s.bar === prevBar);
          if (prevSlot && !countedAttemptIdsRef.current.has(prevSlot.id)) {
            countedAttemptIdsRef.current.add(prevSlot.id);
            attemptsRef.current += 1;
            setAttemptsCount((v) => v + 1);
            if (!matchedSlotIdsRef.current.has(prevSlot.id)) {
              setMissCount((v) => v + 1);
            }
          }
          lastCountedBarIndexRef.current = currentBarIndexCalc;
        }
      }
    } catch {}

    // Auto stop when attempts reached total slots
    try {
      const attemptsNow = attemptsRef.current || 0;
      const total = hitsTotalRef.current || 0;
      if (total > 0 && attemptsNow >= total && stopRef.current) {
        stopRef.current();
        return;
      }
    } catch {}

    rafIdRef.current = requestAnimationFrame(loopDetect);
  }, [processOnset, updateHudByTime]);

  const scheduleClickTrack = useCallback((startAt) => {
    if (!clickEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    clickNextTimeRef.current = startAt;
    clickBeatCountRef.current = 0;
    const scheduleAhead = 2.0; // seconds
    const beatDur = beatDurationRef.current;

    const scheduleChunk = () => {
      if (!audioContextRef.current) return;
      const now = ctx.currentTime;
      while (clickNextTimeRef.current < now + scheduleAhead) {
        const isDownbeat = clickBeatCountRef.current % timeSig === 0;
        const t = clickNextTimeRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isDownbeat ? 1200 : 900, t);
        const vol = Math.max(0, Math.min(1, clickVolume));
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        try {
          osc.start(t);
          osc.stop(t + 0.1);
        } catch {}
        clickNextTimeRef.current += beatDur;
        clickBeatCountRef.current += 1;
      }
    };

    // schedule immediately and keep scheduling ahead
    scheduleChunk();
    clickScheduleTimerRef.current = setInterval(scheduleChunk, 100);
  }, [clickEnabled, clickVolume, timeSig]);

  const start = useCallback(async () => {
    if (isRunning) return;
    try {
      // Reset detection refs for a clean session
      isAboveRef.current = false;
      lastOnsetTimeRef.current = 0;
      matchedSlotIdsRef.current = new Set();

      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = media;

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(media);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Ensure audio context is running before scheduling sounds
      if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch {}
      }

      // Đếm ngược 1 ô nhịp trước khi bắt đầu để phách đầu luôn chuẩn
      const beatDur = 60 / bpm;
      const barLen = timeSig * beatDur;
      const countdownDur = barLen;
      countdownEndTimeRef.current = ctx.currentTime + countdownDur;
      setCountdownMsLeft(Math.ceil(countdownDur * 1000));
      setIsCountingDown(true);

      setIsRunning(true);
      rafIdRef.current = requestAnimationFrame(loopDetect);

      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        const nowCtx = audioContextRef.current?.currentTime || 0;
        const msLeft = Math.max(0, Math.round((countdownEndTimeRef.current - nowCtx) * 1000));
        setCountdownMsLeft(msLeft);
        if (msLeft <= 0) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          setIsCountingDown(false);
          const startAt = countdownEndTimeRef.current + 0.02;
          scheduleLoop(startAt);
        }
      }, 50);
    } catch (e) {
      console.error("Không thể truy cập microphone:", e);
      stop();
      throw e;
    }
  }, [isRunning, scheduleLoop, loopDetect]);

  const stop = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = null;
    if (clickScheduleTimerRef.current) {
      clearInterval(clickScheduleTimerRef.current);
      clickScheduleTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    // Reset detection gate to avoid stuck cooldown with new AudioContext later
    isAboveRef.current = false;
    lastOnsetTimeRef.current = 0;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsRunning(false);
    setIsCountingDown(false);

    // Ghi nhận tiến độ phiên hiện tại cho tone + progression nếu có lượt đánh
    try {
      const attemptsNow = hitsCorrectRef.current + missCountRef.current;
      if (attemptsNow > 0) {
        const accNow = Math.floor((hitsCorrectRef.current * 100) / attemptsNow);
        if (selectedTone && progressionPreset) {
          markProgress(selectedTone, progressionPreset, accNow);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  // Dung sai cố định, không phụ thuộc UI

  // Re-schedule click track when toggled on during a running session or when tempo/params change
  useEffect(() => {
    if (!isRunning || !audioContextRef.current) return;
    if (clickScheduleTimerRef.current) {
      clearInterval(clickScheduleTimerRef.current);
      clickScheduleTimerRef.current = null;
    }
    if (clickEnabled) {
      const ctx = audioContextRef.current;
      const beatDur = beatDurationRef.current;
      const barStart = barStartTimeRef.current || ctx.currentTime;
      const now = ctx.currentTime;
      // Tính thời điểm bắt đầu trùng lưới beat hiện hành (next beat trên cùng grid với slots)
      const beatsSinceStart = Math.max(0, (now - barStart) / beatDur);
      const nextBeatIndex = Math.ceil(beatsSinceStart);
      const alignedStart = barStart + nextBeatIndex * beatDur + 0.02; // +20ms an toàn
      scheduleClickTrack(alignedStart);
    }
  }, [clickEnabled, bpm, timeSig, clickVolume, isRunning, scheduleClickTrack]);

  const accuracy = attemptsCount > 0 ? Math.floor((hitsCorrect * 100) / attemptsCount) : 0;

  useEffect(() => { hitsCorrectRef.current = hitsCorrect; }, [hitsCorrect]);
  useEffect(() => { missCountRef.current = missCount; }, [missCount]);
  useEffect(() => { attemptsRef.current = attemptsCount; }, [attemptsCount]);
  useEffect(() => { stopRef.current = stop; }, [stop]);

  // Derived overall stats across tones
  const totalTones = Object.keys(toneChords).length;
  const completedTones = Object.keys(toneChords).reduce((sum, tone) => {
    const toneMap = progressMap[tone] || {};
    const ok = PROGRESSION_PRESETS.every((p) => (toneMap[p] || 0) >= COMPLETION_THRESHOLD);
    return sum + (ok ? 1 : 0);
  }, 0);
  const completedPercent = totalTones > 0 ? Math.round((completedTones * 100) / totalTones) : 0;

  return {
    // state
    isRunning,
    bpm,
    setBpm,
    timeSig,
    setTimeSig,
    subdivision,
    setSubdivision,
    selectedTone,
    setSelectedTone,
    progressionPreset,
    setProgressionPreset,
    patternText,
    setPatternText,
    barsPerLoop,
    setBarsPerLoop,
    clickEnabled,
    setClickEnabled,
    clickVolume,
    setClickVolume,

    currentBarIndex,
    currentBeatIndex,
    currentChord,
    nextChord,
    hitsTotal,
    hitsCorrect,
    missCount,
    attempts: attemptsCount,
    accuracy,

    // overall stats
    totalTones,
    completedTones,
    completedPercent,

    // progress helpers
    PROGRESSION_PRESETS,
    COMPLETION_THRESHOLD,
    getToneProgress,
    passNotice,
    acknowledgePass: () => setPassNotice(null),
    isCountingDown,
    countdownMsLeft,

    // controls
    start,
    stop,
    getToneChords,
  };
}


