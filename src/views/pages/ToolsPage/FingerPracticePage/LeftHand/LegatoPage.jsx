import Header from "../../../../components/homeItem/Header/Header";
import styles from "../FingerPracticePage.module.css";

export default function LegatoPage() {
  return (
    <>
      <Header />
      <main className={styles.chordPracticePage}>
        <div className={styles.container}>
          <h1 className={styles.title}>Legato (Hammer-on / Pull-off / Trill)</h1>
          <p className={styles.subtitle}>Bài tập legato theo tempo. Nội dung sẽ được bổ sung.</p>
        </div>
      </main>
    </>
  );
}


