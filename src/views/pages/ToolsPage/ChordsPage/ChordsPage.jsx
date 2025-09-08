import styles from "./ChordsPage.module.css";
import Header from "../../../components/homeItem/Header/Header";
import Footer from "../../../components/homeItem/Footer/Footer";

import GuitarChordSVG from "../../../../assets/SVG/guiarChord/GuitarChordSVG";
import PianoChordSVG from "../../../../assets/SVG/pianoChord/PianoChordSVG";

import useChordsViewModel from "../../../../viewmodels/ChordsViewModel";

export default function ChordsPage() {
  const {
    instrument,
    setInstrument,
    selectedTone,
    setSelectedTone,
    chords,
    toneOptions,
  } = useChordsViewModel();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.chords}>
        <div className={styles.chords__container}>
          <h2 className={styles.chords__title}>🎶 Tra cứu hợp âm theo Tone</h2>

          <div className={styles.chords__controls}>
            {/* chọn nhạc cụ */}
            <label className={styles.chords__label}>
              Nhạc cụ:
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className={styles.chords__select}
              >
                <option value="Guitar">Guitar</option>
                <option value="Piano">Piano</option>
              </select>
            </label>

            {/* chọn tone */}
            <label className={styles.chords__label}>
              Chọn Tone:
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className={styles.chords__select}
              >
                {toneOptions.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* list hợp âm */}
          <div className={styles.chords__list}>
            {chords.map((chord) => (
              <div key={chord} className={styles.chords__card}>
                <div className={styles.chords__item}>
                  {instrument === "Guitar" ? (
                    <GuitarChordSVG chord={chord} />
                  ) : (
                    <PianoChordSVG chord={chord} />
                  )}
                  <div className={styles.chords__name}>{chord}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
