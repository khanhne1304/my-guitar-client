import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LessonNavigation.module.css';

/**
 * LessonNavigation Component
 * Navigation giữa các bài học trong khóa học
 */
export default function LessonNavigation({
  course,
  currentModule,
  currentLesson,
  onNavigate,
  className = '',
  ...props
}) {
  if (!course || !currentModule || !currentLesson) {
    return null;
  }

  // Get all lessons from all modules
  const allLessons = course.modules.flatMap(module => 
    module.lessons.map(lesson => ({
      ...lesson,
      moduleId: module._id,
      moduleTitle: module.title,
      moduleOrder: module.order
    }))
  ).sort((a, b) => {
    // Sort by module order first, then by lesson order
    if (a.moduleOrder !== b.moduleOrder) {
      return a.moduleOrder - b.moduleOrder;
    }
    return a.order - b.order;
  });

  const currentIndex = allLessons.findIndex(lesson => lesson._id === currentLesson._id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Get lesson progress (mock data - in real app, get from user progress)
  const getLessonProgress = (lessonId) => {
    // Mock progress data
    const progressData = {
      completed: Math.random() > 0.5,
      progress: Math.floor(Math.random() * 100),
      timeSpent: Math.floor(Math.random() * 1800) // seconds
    };
    return progressData;
  };

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${styles.lessonNavigation} ${className}`} {...props}>
      <div className={styles.lessonNavigation__header}>
        <h3>📚 Nội dung khóa học</h3>
        <div className={styles.lessonNavigation__progress}>
          <span>
            Bài {currentIndex + 1} / {allLessons.length}
          </span>
        </div>
      </div>

      <div className={styles.lessonNavigation__content}>
        {/* Previous/Next Navigation */}
        <div className={styles.lessonNavigation__nav}>
          {prevLesson ? (
            <Link
              to={`/learning/${course._id}/${prevLesson.moduleId}/${prevLesson._id}`}
              className={styles.lessonNavigation__navButton}
              onClick={() => onNavigate?.('prev')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className={styles.lessonNavigation__navInfo}>
                <span className={styles.lessonNavigation__navLabel}>Bài trước</span>
                <span className={styles.lessonNavigation__navTitle}>
                  {prevLesson.title}
                </span>
              </div>
            </Link>
          ) : (
            <div className={`${styles.lessonNavigation__navButton} ${styles.disabled}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className={styles.lessonNavigation__navInfo}>
                <span className={styles.lessonNavigation__navLabel}>Bài trước</span>
                <span className={styles.lessonNavigation__navTitle}>Không có</span>
              </div>
            </div>
          )}

          {nextLesson ? (
            <Link
              to={`/learning/${course._id}/${nextLesson.moduleId}/${nextLesson._id}`}
              className={styles.lessonNavigation__navButton}
              onClick={() => onNavigate?.('next')}
            >
              <div className={styles.lessonNavigation__navInfo}>
                <span className={styles.lessonNavigation__navLabel}>Bài tiếp</span>
                <span className={styles.lessonNavigation__navTitle}>
                  {nextLesson.title}
                </span>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className={`${styles.lessonNavigation__navButton} ${styles.disabled}`}>
              <div className={styles.lessonNavigation__navInfo}>
                <span className={styles.lessonNavigation__navLabel}>Bài tiếp</span>
                <span className={styles.lessonNavigation__navTitle}>Hoàn thành</span>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Course Outline */}
        <div className={styles.lessonNavigation__outline}>
          <h4>📋 Tổng quan khóa học</h4>
          <div className={styles.lessonNavigation__modules}>
            {course.modules.map((module, moduleIndex) => (
              <div key={module._id} className={styles.lessonNavigation__module}>
                <div className={styles.lessonNavigation__moduleHeader}>
                  <h5 className={styles.lessonNavigation__moduleTitle}>
                    {moduleIndex + 1}. {module.title}
                  </h5>
                  <span className={styles.lessonNavigation__moduleStats}>
                    {module.lessons.length} bài học
                  </span>
                </div>
                
                <div className={styles.lessonNavigation__lessons}>
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isCurrentLesson = lesson._id === currentLesson._id;
                    const progress = getLessonProgress(lesson._id);
                    const globalIndex = allLessons.findIndex(l => l._id === lesson._id);
                    
                    return (
                      <div
                        key={lesson._id}
                        className={`${styles.lessonNavigation__lesson} ${
                          isCurrentLesson ? styles.current : ''
                        } ${progress.completed ? styles.completed : ''}`}
                      >
                        <Link
                          to={`/learning/${course._id}/${module._id}/${lesson._id}`}
                          className={styles.lessonNavigation__lessonLink}
                        >
                          <div className={styles.lessonNavigation__lessonNumber}>
                            {globalIndex + 1}
                          </div>
                          <div className={styles.lessonNavigation__lessonContent}>
                            <div className={styles.lessonNavigation__lessonTitle}>
                              {lesson.title}
                            </div>
                            <div className={styles.lessonNavigation__lessonMeta}>
                              <span className={styles.lessonNavigation__lessonType}>
                                {lesson.contentType === 'note' ? '📝 Lý thuyết' :
                                 lesson.contentType === 'chord' ? '🎵 Hợp âm' :
                                 '🥁 Nhịp điệu'}
                              </span>
                              {lesson.duration && (
                                <span className={styles.lessonNavigation__lessonDuration}>
                                  ⏱️ {lesson.duration} phút
                                </span>
                              )}
                            </div>
                            {progress.completed && (
                              <div className={styles.lessonNavigation__lessonProgress}>
                                <span className={styles.lessonNavigation__progressIcon}>✅</span>
                                <span className={styles.lessonNavigation__progressText}>
                                  Hoàn thành ({formatTime(progress.timeSpent)})
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Stats */}
        <div className={styles.lessonNavigation__stats}>
          <div className={styles.lessonNavigation__stat}>
            <span className={styles.lessonNavigation__statLabel}>Tổng bài học:</span>
            <span className={styles.lessonNavigation__statValue}>{allLessons.length}</span>
          </div>
          <div className={styles.lessonNavigation__stat}>
            <span className={styles.lessonNavigation__statLabel}>Đã hoàn thành:</span>
            <span className={styles.lessonNavigation__statValue}>
              {allLessons.filter(lesson => getLessonProgress(lesson._id).completed).length}
            </span>
          </div>
          <div className={styles.lessonNavigation__stat}>
            <span className={styles.lessonNavigation__statLabel}>Tiến độ:</span>
            <span className={styles.lessonNavigation__statValue}>
              {Math.round((allLessons.filter(lesson => getLessonProgress(lesson._id).completed).length / allLessons.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
