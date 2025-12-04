import Header from "../../../components/homeItem/Header/Header";
import PracticeCard from "../../../../components/practice/PracticeCard/PracticeCard";
import { useAuth } from "../../../../context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FingerPracticePage.module.css";

export default function FingerPracticePage() {
  const { isAuthenticated: authIsAuthenticated, authChecked, checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (authChecked && !authIsAuthenticated) {
      navigate('/login');
    }
  }, [authChecked, authIsAuthenticated, navigate]);

  if (!authChecked || !authIsAuthenticated) {
    return (
      <>
        <Header />
        <main className={styles.chordPracticePage}>
          <div className={styles.container}>
            <div className={styles.loadingMessage}>
              <h2>Đang kiểm tra đăng nhập...</h2>
              <p>Vui lòng đăng nhập để sử dụng tính năng luyện tập</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const cards = [
    {
      title: "Luyện tập tay trái",
      description: "Độc lập ngón, legato, stretch, shift vị trí",
      color: "#ffd700",
      to: "/tools/finger-practice/left"
    },
    {
      title: "Luyện tập tay phải",
      description: "Alternate/economy, tremolo, crossing, strumming",
      color: "#ffd700",
      to: "/tools/finger-practice/right"
    }
  ];

  return (
    <>
      <Header />
      <main className={styles.chordPracticePage}>
        <div className={styles.container}>
          <h1 className={styles.title}>Luyện tập ngón tay</h1>
          <p className={styles.subtitle}>
            Chọn mảng kỹ năng bạn muốn cải thiện để bắt đầu luyện tập
          </p>
          <div className={styles.cardsGrid}>
            {cards.map((c, idx) => (
              <PracticeCard
                key={idx}
                title={c.title}
                description={c.description}
                completed={0}
                total={0}
                color={c.color}
                to={c.to}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}


