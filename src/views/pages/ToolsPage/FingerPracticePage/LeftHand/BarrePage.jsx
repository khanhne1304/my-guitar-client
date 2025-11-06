import Header from "../../../../components/homeItem/Header/Header";
import styles from "../FingerPracticePage.module.css";

export default function BarrePage() {
  return (
    <>
      <Header />
      <main className={styles.chordPracticePage}>
        <div className={styles.container}>
          <h1 className={styles.title}>Barre & giữ lực</h1>
          <p className={styles.subtitle}>Giữ barre đều và thả – bấm nhịp nhàng. Nội dung sẽ được bổ sung.</p>
        </div>
      </main>
    </>
  );
}


