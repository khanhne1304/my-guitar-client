import styles from "./PracticeControls.module.css";

export default function PracticeControls({
  isRunning,
  onStart,
  onStop,
  scores,
  isAnalyzing
}) {
  return (
    <div className={styles.practiceControls}>
      <div className={styles.controlsRow}>
        {!isRunning ? (
          <button className={styles.startButton} onClick={onStart}>
            🎤 Bắt đầu luyện tập
          </button>
        ) : (
          <button className={styles.stopButton} onClick={onStop}>
            ⏹ Dừng và chấm điểm
          </button>
        )}
      </div>
      
      {/* Live Scores */}
      {isRunning && (
        <div className={styles.liveScores}>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Độ chính xác:</span>
            <span className={styles.scoreValue}>
              {Math.round(scores.accuracy * 100)}%
            </span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Timing:</span>
            <span className={styles.scoreValue}>
              {Math.round(scores.timingScore * 100)}%
            </span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Clarity:</span>
            <span className={styles.scoreValue}>
              {Math.round(scores.clarityScore * 100)}%
            </span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Speed:</span>
            <span className={styles.scoreValue}>
              {Math.round(scores.speedScore * 100)}%
            </span>
          </div>
        </div>
      )}
      
      {isAnalyzing && (
        <div className={styles.analyzing}>
          <p>Đang phân tích kết quả...</p>
        </div>
      )}
    </div>
  );
}

