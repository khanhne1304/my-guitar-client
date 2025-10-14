import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import styles from './ProgressTracker.module.css';

const ProgressTracker = ({ courseId, userId }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId && userId) {
      fetchProgress();
    }
  }, [courseId, userId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/courses/${courseId}/progress`);
      setProgress(response.data.data);
    } catch (err) {
      setError('Không thể tải tiến độ học tập');
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    if (!progress) return 0;
    return progress.completionPercentage || 0;
  };

  const getCompletedLessons = () => {
    if (!progress) return 0;
    return progress.completedLessons || 0;
  };

  const getTotalLessons = () => {
    if (!progress) return 0;
    return progress.course?.totalLessons || 0;
  };

  const getStreakDays = () => {
    // This would be calculated based on consecutive days of learning
    // For now, return a mock value
    return 7;
  };

  const getTotalPracticeTime = () => {
    if (!progress?.progress) return 0;
    return progress.progress.reduce((total, lesson) => {
      return total + (lesson.timeSpent || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải tiến độ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchProgress} className={styles.retryButton}>
          Thử lại
        </button>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  return (
    <div className={styles.progressTracker}>
      <div className={styles.progressHeader}>
        <h3 className={styles.progressTitle}>Tiến độ học tập</h3>
        <div className={styles.completionPercentage}>
          {getCompletionPercentage()}%
        </div>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${getCompletionPercentage()}%` }}
        ></div>
      </div>

      <div className={styles.progressStats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{getCompletedLessons()}</div>
          <div className={styles.statLabel}>Bài đã hoàn thành</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{getTotalLessons()}</div>
          <div className={styles.statLabel}>Tổng số bài</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{getStreakDays()}</div>
          <div className={styles.statLabel}>Ngày liên tiếp</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{getTotalPracticeTime()}</div>
          <div className={styles.statLabel}>Phút luyện tập</div>
        </div>
      </div>

      <div className={styles.progressDetails}>
        <h4 className={styles.detailsTitle}>Chi tiết tiến độ</h4>
        <div className={styles.lessonsProgress}>
          {progress.progress?.map((lessonProgress, index) => (
            <div key={lessonProgress._id || index} className={styles.lessonProgress}>
              <div className={styles.lessonInfo}>
                <span className={styles.lessonName}>
                  Bài {index + 1}
                </span>
                <span className={styles.lessonStatus}>
                  {lessonProgress.isCompleted ? '✓ Hoàn thành' : '⏳ Đang học'}
                </span>
              </div>
              <div className={styles.lessonProgressBar}>
                <div 
                  className={styles.lessonProgressFill}
                  style={{ 
                    width: lessonProgress.isCompleted ? '100%' : '50%' 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.achievements}>
        <h4 className={styles.achievementsTitle}>Thành tích</h4>
        <div className={styles.achievementsList}>
          {getCompletionPercentage() >= 25 && (
            <div className={styles.achievement}>
              <span className={styles.achievementIcon}>🏆</span>
              <span className={styles.achievementText}>Bắt đầu hành trình</span>
            </div>
          )}
          {getCompletionPercentage() >= 50 && (
            <div className={styles.achievement}>
              <span className={styles.achievementIcon}>🎯</span>
              <span className={styles.achievementText}>Nửa chặng đường</span>
            </div>
          )}
          {getCompletionPercentage() >= 75 && (
            <div className={styles.achievement}>
              <span className={styles.achievementIcon}>🔥</span>
              <span className={styles.achievementText}>Gần hoàn thành</span>
            </div>
          )}
          {getCompletionPercentage() === 100 && (
            <div className={styles.achievement}>
              <span className={styles.achievementIcon}>🎉</span>
              <span className={styles.achievementText}>Hoàn thành khóa học</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
