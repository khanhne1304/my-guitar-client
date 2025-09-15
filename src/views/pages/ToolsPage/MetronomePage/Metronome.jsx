import styles from "./Metronome.module.css";
import Header from "../../../components/homeItem/Header/Header";
import Footer from "../../../components/homeItem/Footer/Footer";
import useMetronomeViewModel from "../../../../viewmodels/MetronomeViewModel";

export default function MetronomeView() {
  const {
    bpm,
    setBpm,
    timeSig,
    setTimeSig,
    isRunning,
    startMetronome,
    stopMetronome,
  } = useMetronomeViewModel();

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
                onChange={(e) => setBpm(Number(e.target.value))}
              />
            </label>

            <div className={styles.metronome__slider}>
              <input
                type="range"
                min="40"
                max="240"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
              />
            </div>

            <label className={styles.metronome__label}>
              Nhịp:
              <select
                value={timeSig}
                onChange={(e) => setTimeSig(Number(e.target.value))}
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
            {isRunning
              ? `Đang chạy: ${bpm} BPM, ${timeSig}/4`
              : "Đang dừng..."}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
