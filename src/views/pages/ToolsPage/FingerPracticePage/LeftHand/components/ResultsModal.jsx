import { useEffect, useRef } from "react";
import RadarChart from "./RadarChart";
import styles from "./ResultsModal.module.css";

export default function ResultsModal({ scores, lesson, onClose }) {
  const modalRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);
  
  const getGrade = (accuracy) => {
    if (accuracy >= 0.9) return "A";
    if (accuracy >= 0.8) return "B";
    if (accuracy >= 0.7) return "C";
    return "D";
  };
  
  const grade = getGrade(scores.accuracy);
  const gradeColor = {
    A: "#4caf50",
    B: "#8bc34a",
    C: "#ffc107",
    D: "#f44336"
  }[grade];
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} ref={modalRef}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        
        <div className={styles.modalHeader}>
          <h2>Kết quả luyện tập</h2>
          <p className={styles.lessonTitle}>{lesson.title}</p>
        </div>
        
        {/* Overall Score */}
        <div className={styles.overallScore}>
          <div className={styles.scoreCircle} style={{ borderColor: gradeColor }}>
            <span className={styles.scorePercentage}>
              {Math.round(scores.accuracy * 100)}%
            </span>
            <span className={styles.grade} style={{ color: gradeColor }}>
              {grade}
            </span>
          </div>
        </div>
        
        {/* Detailed Scores */}
        <div className={styles.detailedScores}>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Timing (Nhịp)</span>
            <span className={styles.scoreValue}>
              {Math.round(scores.timingScore * 100)}%
            </span>
          </div>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Clarity (Độ rõ)</span>
            <span className={styles.scoreValue}>
              {Math.round(scores.clarityScore * 100)}%
            </span>
          </div>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Speed (Tốc độ)</span>
            <span className={styles.scoreValue}>
              {Math.round(scores.speedScore * 100)}%
            </span>
          </div>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Consistency (Đều)</span>
            <span className={styles.scoreValue}>
              {Math.round(scores.consistency * 100)}%
            </span>
          </div>
        </div>
        
        {/* Radar Chart */}
        <div className={styles.radarSection}>
          <h3>Biểu đồ đánh giá</h3>
          <RadarChart scores={scores} />
        </div>
        
        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.retryButton} onClick={onClose}>
            Luyện tập lại
          </button>
          <button className={styles.closeModalButton} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

