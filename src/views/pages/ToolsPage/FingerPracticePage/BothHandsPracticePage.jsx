import Header from "../../../components/homeItem/Header/Header";
import styles from "./FingerPracticePage.module.css";

export default function BothHandsPracticePage() {
  return (
    <>
      <Header />
      <main className={styles.chordPracticePage}>
        <div className={styles.container}>
          <h1 className={styles.title}>Phối hợp hai tay</h1>
          <p className={styles.subtitle}>Đồng bộ tay trái - tay phải, cross-string sync, accent/polyrhythm.</p>
        </div>
      </main>
    </>
  );
}


