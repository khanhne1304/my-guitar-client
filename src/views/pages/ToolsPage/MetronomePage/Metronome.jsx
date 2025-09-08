import { useEffect, useRef, useState } from "react";
import styles from "./Metronome.module.css";
import Header from "../../../components/homeItem/Header/Header";
import Footer from "../../../components/homeItem/Footer/Footer";

export default function Metronome() {
  const [bpm, setBpm] = useState(100);
  const [timeSig, setTimeSig] = useState(4);
  const [isRunning, setIsRunning] = useState(false);

  // Refs cho audio scheduling
  const audioCtxRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const beatCountRef = useRef(0);
  const timerIdRef = useRef(null);

  const lookahead = 25; // ms: scheduler kiểm tra đều đặn
  const scheduleAheadTime = 0.1; // giây: đặt lịch trước một đoạn ngắn

  // Tạo tick
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

    // cập nhật state UI (hiệu ứng beat)
  };

  // Tính toán nhịp tiếp theo
  const nextNote = () => {
  const secondsPerBeat = 60.0 / bpm; // luôn đọc bpm mới
  nextNoteTimeRef.current += secondsPerBeat;
  beatCountRef.current++;
};


  // Scheduler: kiểm tra và đặt lịch note
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
    nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05; // start sau 50ms
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

  // cleanup khi unmount
  useEffect(() => {
    return () => {
      stopMetronome();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.metronome}>
        <div className={styles.metronome__container}>
          <h2 className={styles.metronome__title}>🎵 Máy đếm nhịp</h2>

          <div className={styles.metronome__controls}>
            <label className={styles.metronome__label}>
              BPM:
              <input
                type="number"
                min="40"
                max="240"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))} // đổi ngay lập tức
              />
            </label>
            <div className={styles.metronome__slider}>
              <input
                type="range"
                min="40"
                max="240"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))} // đổi ngay lập tức
              />
            </div>

            <label className={styles.metronome__label}>
              Nhịp:
              <select
                value={timeSig}
                onChange={(e) => {
                  setTimeSig(Number(e.target.value));
                  beatCountRef.current = 0; // reset về phách đầu khi đổi nhịp
                }}
              >
                <option value={2}>2/4</option>
                <option value={3}>3/4</option>
                <option value={4}>4/4</option>
              </select>
            </label>
          </div>

          <div className={styles.metronome__buttons}>
            {isRunning ? (
              <button
                onClick={stopMetronome}
                className={`${styles.metronome__btn} ${styles["metronome__btn--stop"]}`}
              >
                Stop
              </button>
            ) : (
              <button
                onClick={startMetronome}
                className={`${styles.metronome__btn} ${styles["metronome__btn--start"]}`}
              >
                Start
              </button>
            )}
          </div>

          <p className={styles.metronome__status}>
            {isRunning ? `Đang chạy: ${bpm} BPM, ${timeSig}/4` : "Đang dừng..."}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
