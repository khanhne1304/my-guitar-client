import Header from "../../../components/homeItem/Header/Header";
import PracticeCard from "../../../../components/practice/PracticeCard/PracticeCard";
import { usePractice } from "../../../../context/PracticeContext";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import styles from "./ChordPracticePage.module.css";

export default function ChordPracticePage() {
  const { getProgressStats, isAuthenticated } = usePractice();
  const { isAuthenticated: authIsAuthenticated, authChecked, checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  // Kiểm tra đăng nhập
  useEffect(() => {
    // Kiểm tra lại auth status khi component mount
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Redirect riêng biệt để tránh conflict - chỉ khi đã check auth
  useEffect(() => {
    if (authChecked && !authIsAuthenticated) {
      navigate('/login');
    }
  }, [authChecked, authIsAuthenticated, navigate]);

  const practiceCards = [
    {
      id: 1,
      title: "Luyện tập ghi nhớ hợp âm",
      description: "Học và ghi nhớ các hợp âm cơ bản",
      color: "#ffd700"
    },
    {
      id: 3,
      title: "Luyện tập theo nhịp",
      description: "Chơi hợp âm theo nhịp điệu",
      color: "#ffd700"
    }
  ];

  // Hiển thị loading nếu chưa check auth hoặc chưa đăng nhập
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

  return (
    <>
      <Header />
      <main className={styles.chordPracticePage}>
        <div className={styles.container}>
          <h1 className={styles.title}>Luyện tập hợp âm</h1>
          <p className={styles.subtitle}>
            Cải thiện kỹ năng chơi guitar của bạn với các bài luyện tập hợp âm
          </p>
          
           <div className={styles.cardsGrid}>
             {practiceCards.map((card) => {
               const stats = getProgressStats(card.id);
               return (
                 <PracticeCard
                   key={card.id}
                   id={card.id}
                   title={card.title}
                   description={card.description}
                   completed={stats.completed}
                   total={stats.total}
                   color={card.color}
                 />
               );
             })}
           </div>
        </div>
      </main>
    </>
  );
}
