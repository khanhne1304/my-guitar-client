import React, { useState, useEffect } from 'react';
import { getCourseProgress } from '../../services/progressService';
import styles from './ProgressTracker.module.css';

/**
 * ProgressTracker Component
 * Hiển thị % hoàn thành mỗi khóa học
 */
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
      setError(null);
      
      const response = await getCourseProgress(courseId);
      if (response.success) {
        setProgress(response.data);
      } else {
        setError(response.message || 'Không thể tải tiến độ');
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err.message || 'Có lỗi khi tải tiến độ');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = () => {
    if (!progress || !progress.modules) return 0;
    
    const totalLessons = progress.modules.reduce((total, module) => {
      return total + (module.lessons ? module.lessons.length : 0);
    }, 0);
    
    const completedLessons = progress.modules.reduce((total, module) => {
      if (!module.lessons) return total;
      return total + module.lessons.filter(lesson => lesson.isCompleted).length;
    }, 0);
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const getModuleProgress = (module) => {
    if (!module.lessons) return 0;
    const completedLessons = module.lessons.filter(lesson => lesson.isCompleted).length;
    return Math.round((completedLessons / module.lessons.length) * 100);
  };

  const getLessonStatus = (lesson) => {
    if (lesson.isCompleted) return 'completed';
    if (lesson.lastAccessedAt) return 'in-progress';
    return 'not-started';
  };

  if (loading) {
    return (
      <div className={styles.progressTracker}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải tiến độ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.progressTracker}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchProgress} className={styles.retryButton}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  const overallProgress = calculateOverallProgress();

  return (
    <div className={styles.progressTracker}>
      <div className={styles.progressHeader}>
        <h3 className={styles.progressTitle}>📊 Tiến độ học tập</h3>
        <div className={styles.overallProgress}>
          <div className={styles.progressCircle}>
            <svg className={styles.progressSvg} viewBox="0 0 100 100">
              <circle
                className={styles.progressBackground}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                className={styles.progressBar}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallProgress / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className={styles.progressText}>
              <span className={styles.progressNumber}>{overallProgress}%</span>
              <span className={styles.progressLabel}>Hoàn thành</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.progressDetails}>
        <h4 className={styles.detailsTitle}>Chi tiết tiến độ</h4>
        
        {progress.modules && progress.modules.length > 0 ? (
          <div className={styles.modulesProgress}>
            {progress.modules.map((module, index) => (
              <div key={module._id || index} className={styles.moduleProgress}>
                <div className={styles.moduleHeader}>
                  <h5 className={styles.moduleTitle}>
                    Module {index + 1}: {module.title}
                  </h5>
                  <span className={styles.modulePercentage}>
                    {getModuleProgress(module)}%
                  </span>
                </div>
                
                <div className={styles.moduleProgressBar}>
                  <div 
                    className={styles.moduleProgressFill}
                    style={{ width: `${getModuleProgress(module)}%` }}
                  ></div>
                </div>
                
                {module.lessons && module.lessons.length > 0 && (
                  <div className={styles.lessonsList}>
                    {module.lessons.map((lesson, lessonIndex) => {
                      const status = getLessonStatus(lesson);
                      return (
                        <div key={lesson._id || lessonIndex} className={styles.lessonItem}>
                          <div className={styles.lessonInfo}>
                            <span className={styles.lessonNumber}>
                              {lessonIndex + 1}
                            </span>
                            <span className={styles.lessonTitle}>
                              {lesson.title}
                            </span>
                          </div>
                          <div className={styles.lessonStatus}>
                            <span className={`${styles.statusBadge} ${styles[status]}`}>
                              {status === 'completed' && '✓ Hoàn thành'}
                              {status === 'in-progress' && '▶ Đang học'}
                              {status === 'not-started' && '⏸ Chưa bắt đầu'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noProgress}>
            <p>Chưa có dữ liệu tiến độ cho khóa học này.</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className={styles.statistics}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {progress.modules ? progress.modules.reduce((total, module) => {
              return total + (module.lessons ? module.lessons.length : 0);
            }, 0) : 0}
          </div>
          <div className={styles.statLabel}>Tổng bài học</div>
        </div>
        
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {progress.modules ? progress.modules.reduce((total, module) => {
              if (!module.lessons) return total;
              return total + module.lessons.filter(lesson => lesson.isCompleted).length;
            }, 0) : 0}
          </div>
          <div className={styles.statLabel}>Đã hoàn thành</div>
        </div>
        
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {progress.totalPracticeTime || 0}
          </div>
          <div className={styles.statLabel}>Phút luyện tập</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;