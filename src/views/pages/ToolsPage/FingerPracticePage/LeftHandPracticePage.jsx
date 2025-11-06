import Header from "../../../components/homeItem/Header/Header";
import { Link, useNavigate } from "react-router-dom";
import styles from "../ChordPracticePage/ChordPracticeDetailPage.module.css";

export default function LeftHandPracticePage() {
  const navigate = useNavigate();
  const items = [
    { name: "Luyện tập chạy ngón", to: "/tools/finger-practice/left/independence" },
    { name: "Legato (HO/PO/Trill)", to: "/tools/finger-practice/left/legato" },
    { name: "Stretch & dịch vị trí", to: "/tools/finger-practice/left/stretch-shift" },
    { name: "Barre & giữ lực", to: "/tools/finger-practice/left/barre" }
  ];

  const total = items.length;
  const completed = 0; // TODO: gắn dữ liệu tiến độ thực tế sau

  return (
    <>
      <Header />
      <main className={styles.detailPage}>
        <div className={styles.container}>
          <button onClick={() => navigate("/tools/finger-practice")} className={styles.backButton}>
            ← Quay lại
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Luyện tập tay trái</h1>
            <p className={styles.description}>Độc lập ngón, legato, stretch, chuyển vị trí.</p>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressCard}>
              <h3>Tiến độ hiện tại</h3>
              <div className={styles.progressStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{completed}</span>
                  <span className={styles.statLabel}>Đã hoàn thành</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{total}</span>
                  <span className={styles.statLabel}>Tổng số</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
                  <span className={styles.statLabel}>Hoàn thành</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.section}>
              <h2>Bài luyện tập tay trái</h2>
              <div className={styles.chordsList}>
                <div className={styles.chordsGrid}>
                  {items.map((it) => (
                    <div key={it.to} className={styles.chordItem}>
                      <span className={styles.chordName}>{it.name}</span>
                      <Link className={styles.practiceBtn} to={it.to}>Bắt đầu</Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


