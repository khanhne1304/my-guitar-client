import Header from "../../../../components/homeItem/Header/Header";
import styles from "../FingerPracticePage.module.css";

export default function StretchShiftPage() {
  return (
    <>
      <Header />
      <main className={styles.chordPracticePage}>
        <div className={styles.container}>
          <h1 className={styles.title}>Stretch & dịch vị trí</h1>
          <p className={styles.subtitle}>Kéo giãn an toàn và chuyển vị trí xa. Nội dung sẽ được bổ sung.</p>
        </div>
      </main>
    </>
  );
}


