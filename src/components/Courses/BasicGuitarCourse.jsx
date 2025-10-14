import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import ProgressTracker from './ProgressTracker';
import NewbieGuide from './NewbieGuide';
import styles from './BasicGuitarCourse.module.css';

const BasicGuitarCourse = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({});
  const [userId, setUserId] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetchCourse();
    // Get user ID from localStorage or context
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserId(user.id);
    }
    
    // Show guide for new users
    const hasSeenGuide = localStorage.getItem('hasSeenGuitarGuide');
    if (!hasSeenGuide) {
      setShowGuide(true);
    }
  }, []);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/courses/basic-guitar');
      setCourse(response.data.data);
    } catch (err) {
      setError('Không thể tải khóa học');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const getModuleProgress = (module) => {
    if (!module.lessons) return 0;
    const completedLessons = module.lessons.filter(lesson => 
      progress[lesson._id]?.isCompleted
    ).length;
    return Math.round((completedLessons / module.lessons.length) * 100);
  };

  const getLessonStatus = (lessonId) => {
    const lessonProgress = progress[lessonId];
    if (lessonProgress?.isCompleted) return 'completed';
    if (lessonProgress?.lastAccessedAt) return 'in-progress';
    return 'not-started';
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải khóa học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Lỗi tải khóa học</h2>
        <p>{error}</p>
        <button onClick={fetchCourse} className={styles.retryButton}>
          Thử lại
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.error}>
        <h2>Không tìm thấy khóa học</h2>
        <p>Khóa học guitar cơ bản không tồn tại.</p>
      </div>
    );
  }

  return (
    <div className={styles.courseContainer}>
      {/* Newbie Guide */}
      {showGuide && (
        <NewbieGuide 
          onClose={() => {
            setShowGuide(false);
            localStorage.setItem('hasSeenGuitarGuide', 'true');
          }}
        />
      )}
      {/* Course Header */}
      <div className={styles.courseHeader}>
        <div className={styles.courseThumbnail}>
          <img src={course.thumbnail} alt={course.title} />
        </div>
        <div className={styles.courseInfo}>
          <h1 className={styles.courseTitle}>{course.title}</h1>
          <p className={styles.courseDescription}>{course.description}</p>
          <div className={styles.courseStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{course.moduleCount}</span>
              <span className={styles.statLabel}>Module</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{course.lessonCount}</span>
              <span className={styles.statLabel}>Bài học</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{course.level}</span>
              <span className={styles.statLabel}>Cấp độ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Modules */}
      <div className={styles.modulesContainer}>
        <h2 className={styles.modulesTitle}>Nội dung khóa học</h2>
        
        {course.modules?.map((module, moduleIndex) => (
          <div key={module._id} className={styles.module}>
            <div className={styles.moduleHeader}>
              <div className={styles.moduleInfo}>
                <h3 className={styles.moduleTitle}>
                  Module {moduleIndex + 1}: {module.title}
                </h3>
                <p className={styles.moduleDescription}>{module.description}</p>
              </div>
              <div className={styles.moduleProgress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${getModuleProgress(module)}%` }}
                  ></div>
                </div>
                <span className={styles.progressText}>
                  {getModuleProgress(module)}% hoàn thành
                </span>
              </div>
            </div>

            <div className={styles.lessonsList}>
              {module.lessons?.map((lesson, lessonIndex) => {
                const status = getLessonStatus(lesson._id);
                return (
                  <Link
                    key={lesson._id}
                    to={`/lessons/${lesson._id}`}
                    className={`${styles.lessonCard} ${styles[status]}`}
                  >
                    <div className={styles.lessonIcon}>
                      {status === 'completed' && <span className={styles.checkIcon}>✓</span>}
                      {status === 'in-progress' && <span className={styles.playIcon}>▶</span>}
                      {status === 'not-started' && <span className={styles.lockIcon}>🔒</span>}
                    </div>
                    <div className={styles.lessonContent}>
                      <h4 className={styles.lessonTitle}>
                        Bài {lessonIndex + 1}: {lesson.title}
                      </h4>
                      <p className={styles.lessonDescription}>{lesson.description}</p>
                      <div className={styles.lessonMeta}>
                        <span className={styles.lessonDuration}>
                          {lesson.practiceSettings?.estimatedDuration || 15} phút
                        </span>
                        <span className={styles.lessonDifficulty}>
                          {lesson.practiceSettings?.difficulty || 'beginner'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.lessonStatus}>
                      {status === 'completed' && (
                        <span className={styles.completedBadge}>Hoàn thành</span>
                      )}
                      {status === 'in-progress' && (
                        <span className={styles.progressBadge}>Đang học</span>
                      )}
                      {status === 'not-started' && (
                        <span className={styles.lockedBadge}>Chưa mở</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Tracker */}
      {userId && (
        <ProgressTracker courseId={course._id} userId={userId} />
      )}

      {/* Course Features */}
      {course.interactiveFeatures && (
        <div className={styles.featuresContainer}>
          <h3 className={styles.featuresTitle}>Tính năng khóa học</h3>
          <div className={styles.featuresList}>
            {course.interactiveFeatures.hasMetronome && (
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🎵</span>
                <span className={styles.featureText}>Metronome tích hợp</span>
              </div>
            )}
            {course.interactiveFeatures.hasProgressTracking && (
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📊</span>
                <span className={styles.featureText}>Theo dõi tiến độ</span>
              </div>
            )}
            {course.interactiveFeatures.hasExercises && (
              <div className={styles.feature}>
                <span className={styles.featureIcon}>💪</span>
                <span className={styles.featureText}>Bài tập tương tác</span>
              </div>
            )}
            {course.interactiveFeatures.hasGamification && (
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🏆</span>
                <span className={styles.featureText}>Hệ thống điểm thưởng</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicGuitarCourse;
