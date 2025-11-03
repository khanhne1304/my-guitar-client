import { useNavigate } from "react-router-dom";
import styles from "./PracticeCard.module.css";

export default function PracticeCard({ title, description, completed, total, color, id }) {
  const navigate = useNavigate();
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const circumference = 2 * Math.PI * 35; // radius = 35, width/height = 80, so cx/cy = 40
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleCardClick = () => {
    // Click toàn bộ thẻ sẽ mở trang chi tiết, không lật thẻ
    if (id === 3) {
      navigate(`/tools/chord-practice/rhythm`);
    } else {
      navigate(`/tools/chord-practice/${id}`);
    }
  };

  return (
    <div 
      className={styles.card}
      onClick={handleCardClick}
    >
      {/* Chỉ hiển thị mặt trước, không có flip */}
      <div className={styles.cardFront}>
        <div className={styles.cardFrontContent}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
        {/* Vòng tròn tiến độ */}
        <div className={styles.progressCircleContainer}>
          <svg className={styles.progressCircle} width="80" height="80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="8" />
            <circle cx="40" cy="40" r="35" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
          </svg>
          <div className={styles.progressText}>
            <span className={styles.progressNumber}>{percentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
