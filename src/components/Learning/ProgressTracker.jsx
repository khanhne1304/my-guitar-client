import React, { useState, useEffect } from 'react';
import styles from './ProgressTracker.module.css';

/**
 * ProgressTracker Component
 * Hiển thị tiến độ học tập chi tiết của người dùng
 */
export default function ProgressTracker({ progress, lesson, session }) {
  const [stats, setStats] = useState({
    totalTime: 0,
    accuracy: 0,
    streak: 0,
    exercisesCompleted: 0,
    achievements: []
  });

  const [timeSpent, setTimeSpent] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Update stats when progress changes
  useEffect(() => {
    setStats(progress);
  }, [progress]);

  // Track session time
  useEffect(() => {
    let interval;
    
    if (session && !isSessionActive) {
      setIsSessionActive(true);
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else if (!session && isSessionActive) {
      setIsSessionActive(false);
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session, isSessionActive]);

  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress level
  const getProgressLevel = (accuracy) => {
    if (accuracy >= 90) return { level: 'excellent', color: '#10b981', label: 'Xuất sắc' };
    if (accuracy >= 80) return { level: 'good', color: '#3b82f6', label: 'Tốt' };
    if (accuracy >= 70) return { level: 'fair', color: '#f59e0b', label: 'Khá' };
    return { level: 'needs_improvement', color: '#ef4444', label: 'Cần cải thiện' };
  };

  // Get streak level
  const getStreakLevel = (streak) => {
    if (streak >= 10) return { level: 'fire', emoji: '🔥', label: 'Lửa' };
    if (streak >= 5) return { level: 'hot', emoji: '🔥', label: 'Nóng' };
    if (streak >= 3) return { level: 'warm', emoji: '🌡️', label: 'Ấm' };
    return { level: 'cold', emoji: '❄️', label: 'Lạnh' };
  };

  const progressLevel = getProgressLevel(stats.accuracy);
  const streakLevel = getStreakLevel(stats.streak);

  return (
    <div className={styles.progressTracker}>
      {/* Header */}
      <div className={styles.progressTracker__header}>
        <h3>📊 Tiến độ học tập</h3>
        <div className={styles.progressTracker__sessionStatus}>
          {session ? (
            <div className={styles.progressTracker__sessionActive}>
              <div className={styles.progressTracker__sessionIndicator} />
              <span>Đang học - {formatTime(timeSpent)}</span>
            </div>
          ) : (
            <div className={styles.progressTracker__sessionInactive}>
              <span>Chưa bắt đầu</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats */}
      <div className={styles.progressTracker__mainStats}>
        {/* Accuracy */}
        <div className={styles.progressTracker__statCard}>
          <div className={styles.progressTracker__statHeader}>
            <h4>Độ chính xác</h4>
            <span 
              className={styles.progressTracker__statLevel}
              style={{ color: progressLevel.color }}
            >
              {progressLevel.label}
            </span>
          </div>
          <div className={styles.progressTracker__statValue}>
            <span 
              className={styles.progressTracker__statNumber}
              style={{ color: progressLevel.color }}
            >
              {stats.accuracy}%
            </span>
          </div>
          <div className={styles.progressTracker__statBar}>
            <div 
              className={styles.progressTracker__statBarFill}
              style={{ 
                width: `${stats.accuracy}%`,
                backgroundColor: progressLevel.color
              }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className={styles.progressTracker__statCard}>
          <div className={styles.progressTracker__statHeader}>
            <h4>Chuỗi thành công</h4>
            <span className={styles.progressTracker__statLevel}>
              {streakLevel.emoji} {streakLevel.label}
            </span>
          </div>
          <div className={styles.progressTracker__statValue}>
            <span className={styles.progressTracker__statNumber}>
              {stats.streak}
            </span>
          </div>
          <div className={styles.progressTracker__statDescription}>
            {stats.streak > 0 ? 
              `Đã đúng ${stats.streak} lần liên tiếp!` : 
              'Bắt đầu chuỗi thành công'
            }
          </div>
        </div>

        {/* Exercises Completed */}
        <div className={styles.progressTracker__statCard}>
          <div className={styles.progressTracker__statHeader}>
            <h4>Bài tập hoàn thành</h4>
            <span className={styles.progressTracker__statLevel}>
              {stats.exercisesCompleted > 0 ? '🎯' : '📝'}
            </span>
          </div>
          <div className={styles.progressTracker__statValue}>
            <span className={styles.progressTracker__statNumber}>
              {stats.exercisesCompleted}
            </span>
          </div>
          <div className={styles.progressTracker__statDescription}>
            {stats.exercisesCompleted > 0 ? 
              `Đã hoàn thành ${stats.exercisesCompleted} bài tập` : 
              'Chưa có bài tập nào'
            }
          </div>
        </div>

        {/* Total Time */}
        <div className={styles.progressTracker__statCard}>
          <div className={styles.progressTracker__statHeader}>
            <h4>Thời gian học</h4>
            <span className={styles.progressTracker__statLevel}>
              ⏱️
            </span>
          </div>
          <div className={styles.progressTracker__statValue}>
            <span className={styles.progressTracker__statNumber}>
              {formatTime(stats.totalTime)}
            </span>
          </div>
          <div className={styles.progressTracker__statDescription}>
            {stats.totalTime > 0 ? 
              `Đã dành ${formatTime(stats.totalTime)} để học` : 
              'Chưa có thời gian học'
            }
          </div>
        </div>
      </div>

      {/* Achievements */}
      {stats.achievements.length > 0 && (
        <div className={styles.progressTracker__achievements}>
          <h4>🏆 Thành tích đạt được</h4>
          <div className={styles.progressTracker__achievementsList}>
            {stats.achievements.map((achievement, index) => (
              <div key={index} className={styles.progressTracker__achievement}>
                <div className={styles.progressTracker__achievementIcon}>
                  🏆
                </div>
                <div className={styles.progressTracker__achievementContent}>
                  <div className={styles.progressTracker__achievementName}>
                    {achievement.name}
                  </div>
                  <div className={styles.progressTracker__achievementDescription}>
                    {achievement.description}
                  </div>
                  <div className={styles.progressTracker__achievementPoints}>
                    +{achievement.points} điểm
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Info */}
      {lesson && (
        <div className={styles.progressTracker__lessonInfo}>
          <h4>📚 Thông tin bài học</h4>
          <div className={styles.progressTracker__lessonDetails}>
            <div className={styles.progressTracker__lessonDetail}>
              <span className={styles.progressTracker__lessonLabel}>Loại nội dung:</span>
              <span className={styles.progressTracker__lessonValue}>
                {lesson.contentType === 'chord' ? '🎵 Hợp âm' :
                 lesson.contentType === 'rhythm' ? '🥁 Nhịp điệu' :
                 lesson.contentType === 'interactive' ? '🎮 Tương tác' :
                 '📝 Lý thuyết'}
              </span>
            </div>
            
            {lesson.practiceSettings && (
              <>
                <div className={styles.progressTracker__lessonDetail}>
                  <span className={styles.progressTracker__lessonLabel}>Độ khó:</span>
                  <span className={styles.progressTracker__lessonValue}>
                    {lesson.practiceSettings.difficulty === 'beginner' ? '🟢 Cơ bản' :
                     lesson.practiceSettings.difficulty === 'intermediate' ? '🟡 Trung bình' :
                     '🔴 Nâng cao'}
                  </span>
                </div>
                
                <div className={styles.progressTracker__lessonDetail}>
                  <span className={styles.progressTracker__lessonLabel}>BPM mặc định:</span>
                  <span className={styles.progressTracker__lessonValue}>
                    {lesson.practiceSettings.defaultBpm} BPM
                  </span>
                </div>
                
                <div className={styles.progressTracker__lessonDetail}>
                  <span className={styles.progressTracker__lessonLabel}>Thời gian ước tính:</span>
                  <span className={styles.progressTracker__lessonValue}>
                    {lesson.practiceSettings.estimatedDuration} phút
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Progress Tips */}
      <div className={styles.progressTracker__tips}>
        <h4>💡 Mẹo cải thiện</h4>
        <div className={styles.progressTracker__tipsList}>
          {stats.accuracy < 70 && (
            <div className={styles.progressTracker__tip}>
              <span className={styles.progressTracker__tipIcon}>🎯</span>
              <span>Hãy luyện tập chậm và chính xác trước khi tăng tốc độ</span>
            </div>
          )}
          
          {stats.streak < 3 && (
            <div className={styles.progressTracker__tip}>
              <span className={styles.progressTracker__tipIcon}>🔥</span>
              <span>Hãy duy trì chuỗi thành công để cải thiện kỹ năng</span>
            </div>
          )}
          
          {stats.exercisesCompleted === 0 && (
            <div className={styles.progressTracker__tip}>
              <span className={styles.progressTracker__tipIcon}>📝</span>
              <span>Bắt đầu với các bài tập cơ bản để làm quen</span>
            </div>
          )}
          
          {stats.totalTime < 300 && (
            <div className={styles.progressTracker__tip}>
              <span className={styles.progressTracker__tipIcon}>⏰</span>
              <span>Dành ít nhất 5 phút mỗi ngày để luyện tập</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



