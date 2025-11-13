import Header from "../../../../components/homeItem/Header/Header";
import styles from "../../ChordPracticePage/ChordPracticeDetailPage.module.css";

export default function StrummingPage() {
  return (
    <>
      <Header />
      <main className={styles.detailPage}>
        <div className={styles.container}>
          <h1 className={styles.title}>Luyện tập quạt dây</h1>
          <p className={styles.description}>Strumming theo pattern và nhịp. Nội dung sẽ được bổ sung.</p>
        </div>
      </main>
    </>
  );
}


