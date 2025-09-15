import { useEffect, useRef, useState } from "react";

export default function useMetronomeViewModel() {
  const [bpm, setBpm] = useState(100);
  const [timeSig, setTimeSig] = useState(4);
  const [isRunning, setIsRunning] = useState(false);

  const audioCtxRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const beatCountRef = useRef(0);
  const timerIdRef = useRef(null);

  const lookahead = 25;
  const scheduleAheadTime = 0.1;

  const scheduleNote = (beatNumber, time) => {
    if (!audioCtxRef.current) return;

    const osc = audioCtxRef.current.createOscillator();
    const envelope = audioCtxRef.current.createGain();

    osc.type = "sine";
    osc.frequency.value = beatNumber % timeSig === 0 ? 800 : 500;

    envelope.gain.setValueAtTime(0.001, time);
    envelope.gain.exponentialRampToValueAtTime(0.2, time + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(envelope);
    envelope.connect(audioCtxRef.current.destination);

    osc.start(time);
    osc.stop(time + 0.2);
  };

  const nextNote = () => {
    const secondsPerBeat = 60.0 / bpm;
    nextNoteTimeRef.current += secondsPerBeat;
    beatCountRef.current++;
  };

  const scheduler = () => {
    while (
      nextNoteTimeRef.current <
      audioCtxRef.current.currentTime + scheduleAheadTime
    ) {
      scheduleNote(beatCountRef.current, nextNoteTimeRef.current);
      nextNote();
    }
    timerIdRef.current = setTimeout(scheduler, lookahead);
  };

  const startMetronome = () => {
    if (isRunning) return;
    audioCtxRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05;
    beatCountRef.current = 0;
    scheduler();
    setIsRunning(true);
  };

  const stopMetronome = () => {
    clearTimeout(timerIdRef.current);
    timerIdRef.current = null;
    setIsRunning(false);
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopMetronome();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    bpm,
    setBpm,
    timeSig,
    setTimeSig,
    isRunning,
    startMetronome,
    stopMetronome,
  };
}
