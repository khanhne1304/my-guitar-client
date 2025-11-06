import Header from "../../../components/homeItem/Header/Header";
import styles from "./FingerPracticePage.module.css";

export default function RightHandPracticePage() {
  return (
    <>
      <Header />
      <main className={styles.chordPracticePage}>
        <div className={styles.container}>
          <h1 className={styles.title}>Luyện tập tay phải</h1>
          <p className={styles.subtitle}>Alternate/economy picking, tremolo, crossing, strumming.</p>
        </div>
      </main>
    </>
  );
}


