import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../services/courseService';
import { startLesson, logPractice, completeLesson, getLessonProgress, getNextLesson } from '../../services/progressService';
import Metronome from './Metronome';
import styles from './LessonPlayer.module.css';

/**
 * LessonPlayer Component
 * Giao diện học bài với các tính năng:
 * - Hiển thị mục tiêu học
 * - Tabs/Chords/StrumPattern
 * - Video player
 * - Practice checklist
 * - Metronome
 * - Nút hoàn thành bài học
 */
export default function LessonPlayer() {
  const { slug, ml } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Progress state
  const [progress, setProgress] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  
  // Practice state
  const [practiceChecklist, setPracticeChecklist] = useState([]);
  const [practiceMinutes, setPracticeMinutes] = useState(0);
  const [practiceBpm, setPracticeBpm] = useState(120);
  const [practiceNotes, setPracticeNotes] = useState('');
  
  // Metronome state
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(120);
  
  // Refs
  const metronomeRef = useRef(null);
  const practiceTimerRef = useRef(null);

  // Load lesson data
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getCourseById(`${slug}/lessons/${ml}`);
        if (response.success) {
          const { course: courseData, module: moduleData, lesson: lessonData } = response.data;
          setCourse(courseData);
          setModule(moduleData);
          setLesson(lessonData);
          
          // Initialize practice checklist
          if (lessonData.practice?.checklist) {
            setPracticeChecklist(lessonData.practice.checklist.map(item => ({
              text: item,
              completed: false
            })));
          }
          
          // Set metronome BPM from lesson
          if (lessonData.practice?.metronomeBpm) {
            setMetronomeBpm(lessonData.practice.metronomeBpm);
            setPracticeBpm(lessonData.practice.metronomeBpm);
          }
          
          // Load progress
          try {
            const lessonKey = `${courseData.slug}#${moduleData.order}.${lessonData.order}`;
            const progressResponse = await getLessonProgress(lessonKey);
            if (progressResponse.success) {
              setProgress(progressResponse.data);
            }
          } catch (progressErr) {
            console.warn('Could not load progress:', progressErr);
          }
        } else {
          setError(response.message || 'Không tìm thấy bài học');
        }
      } catch (err) {
        console.error('Error loading lesson:', err);
        setError(err.message || 'Có lỗi khi tải bài học');
      } finally {
        setLoading(false);
      }
    };

    if (slug && ml) {
      loadLesson();
    }
  }, [slug, ml]);

  // Load next lesson recommendation
  useEffect(() => {
    const loadNextLesson = async () => {
      if (course?.slug) {
        try {
          const response = await getNextLesson(course.slug);
          if (response.success) {
            setNextLesson(response.data);
          }
        } catch (err) {
          console.warn('Could not load next lesson:', err);
        }
      }
    };

    if (course) {
      loadNextLesson();
    }
  }, [course]);

  // Start lesson
  const handleStartLesson = useCallback(async () => {
    if (!course || !lesson) return;
    
    try {
      const lessonKey = `${course.slug}#${module.order}.${lesson.order}`;
      await startLesson(course._id, lessonKey);
      
      // Reload progress
      const progressResponse = await getLessonProgress(lessonKey);
      if (progressResponse.success) {
        setProgress(progressResponse.data);
      }
    } catch (err) {
      console.error('Error starting lesson:', err);
    }
  }, [course, module, lesson]);

  // Log practice session
  const handleLogPractice = useCallback(async () => {
    if (!course || !lesson || practiceMinutes <= 0) return;
    
    try {
      const lessonKey = `${course.slug}#${module.order}.${lesson.order}`;
      await logPractice(lessonKey, practiceMinutes, practiceBpm, practiceNotes);
      
      // Reset practice form
      setPracticeMinutes(0);
      setPracticeNotes('');
      
      // Reload progress
      const progressResponse = await getLessonProgress(lessonKey);
      if (progressResponse.success) {
        setProgress(progressResponse.data);
      }
    } catch (err) {
      console.error('Error logging practice:', err);
    }
  }, [course, module, lesson, practiceMinutes, practiceBpm, practiceNotes]);

  // Complete lesson
  const handleCompleteLesson = useCallback(async () => {
    if (!course || !lesson) return;
    
    try {
      const lessonKey = `${course.slug}#${module.order}.${lesson.order}`;
      const score = 85; // Default score, can be calculated based on performance
      const acquiredSkills = lesson.skills || [];
      
      await completeLesson(lessonKey, score, acquiredSkills);
      
      // Reload progress
      const progressResponse = await getLessonProgress(lessonKey);
      if (progressResponse.success) {
        setProgress(progressResponse.data);
      }
      
      // Show success message
      alert('Chúc mừng! Bạn đã hoàn thành bài học này!');
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  }, [course, module, lesson]);

  // Toggle checklist item
  const toggleChecklistItem = useCallback((index) => {
    setPracticeChecklist(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, completed: !item.completed } : item
      )
    );
  }, []);

  // Navigate to next lesson
  const handleNextLesson = useCallback(() => {
    if (nextLesson?.nextLesson) {
      const { moduleOrder, lessonOrder } = nextLesson.nextLesson;
      navigate(`/learning/${slug}/lessons/${moduleOrder}.${lessonOrder}`);
    }
  }, [nextLesson, navigate, slug]);

  // Navigate back to course
  const handleBackToCourse = useCallback(() => {
    navigate(`/courses/${slug}`);
  }, [navigate, slug]);

  if (loading) {
    return (
      <div className={styles.lessonPlayer}>
        <div className={styles.lessonPlayer__loading}>
          <div className={styles.lessonPlayer__spinner}></div>
          <p className={styles.lessonPlayer__loadingText}>Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.lessonPlayer}>
        <div className={styles.lessonPlayer__error}>
          <div className={styles.lessonPlayer__errorIcon}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className={styles.lessonPlayer__errorTitle}>Có lỗi xảy ra</h2>
          <p className={styles.lessonPlayer__errorMessage}>{error}</p>
          <button
            onClick={handleBackToCourse}
            className={styles.lessonPlayer__errorButton}
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    );
  }

  if (!course || !lesson || !module) {
    return (
      <div className={styles.lessonPlayer}>
        <div className={styles.lessonPlayer__error}>
          <h2 className={styles.lessonPlayer__errorTitle}>Không tìm thấy bài học</h2>
          <button
            onClick={handleBackToCourse}
            className={styles.lessonPlayer__errorButton}
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.lessonPlayer}>
      {/* Header */}
      <div className={styles.lessonPlayer__header}>
        <div className={styles.lessonPlayer__breadcrumb}>
          <button
            onClick={handleBackToCourse}
            className={styles.lessonPlayer__backButton}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {course.title}
          </button>
          <span className={styles.lessonPlayer__separator}>/</span>
          <span className={styles.lessonPlayer__module}>{module.title}</span>
          <span className={styles.lessonPlayer__separator}>/</span>
          <span className={styles.lessonPlayer__lesson}>{lesson.title}</span>
        </div>
        
        <div className={styles.lessonPlayer__status}>
          {progress?.status === 'completed' && (
            <span className={styles.lessonPlayer__completed}>✅ Hoàn thành</span>
          )}
          {progress?.status === 'in_progress' && (
            <span className={styles.lessonPlayer__inProgress}>🔄 Đang học</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.lessonPlayer__content}>
        {/* Lesson Info */}
        <div className={styles.lessonPlayer__info}>
          <h1 className={styles.lessonPlayer__title}>{lesson.title}</h1>
          <div className={styles.lessonPlayer__meta}>
            <span className={styles.lessonPlayer__type}>{lesson.type}</span>
            <span className={styles.lessonPlayer__duration}>{lesson.durationMin} phút</span>
          </div>
        </div>

        {/* Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <div className={styles.lessonPlayer__objectives}>
            <h3>Mục tiêu học tập:</h3>
            <ul>
              {lesson.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Content */}
        <div className={styles.lessonPlayer__contentSection}>
          {lesson.content?.text && (
            <div className={styles.lessonPlayer__text}>
              <h3>Nội dung bài học:</h3>
              <p>{lesson.content.text}</p>
            </div>
          )}

          {/* Video */}
          {lesson.content?.videoUrl && (
            <div className={styles.lessonPlayer__video}>
              <h3>Video hướng dẫn:</h3>
              <iframe
                src={lesson.content.videoUrl}
                width="100%"
                height="315"
                frameBorder="0"
                allowFullScreen
                title={lesson.title}
              />
            </div>
          )}

          {/* Chords */}
          {lesson.content?.chords && lesson.content.chords.length > 0 && (
            <div className={styles.lessonPlayer__chords}>
              <h3>Hợp âm:</h3>
              <div className={styles.lessonPlayer__chordList}>
                {lesson.content.chords.map((chord, index) => (
                  <div key={index} className={styles.lessonPlayer__chord}>
                    <span className={styles.lessonPlayer__chordName}>{chord.name}</span>
                    {chord.fingering && (
                      <span className={styles.lessonPlayer__chordFingering}>
                        {chord.fingering}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strum Pattern */}
          {lesson.content?.strumPattern && (
            <div className={styles.lessonPlayer__strumPattern}>
              <h3>Tiết tấu:</h3>
              <div className={styles.lessonPlayer__pattern}>
                {lesson.content.strumPattern}
              </div>
            </div>
          )}

          {/* Tabs */}
          {lesson.content?.tabs && lesson.content.tabs.length > 0 && (
            <div className={styles.lessonPlayer__tabs}>
              <h3>Tab:</h3>
              <pre className={styles.lessonPlayer__tabContent}>
                {lesson.content.tabs.join('\n')}
              </pre>
            </div>
          )}
        </div>

        {/* Practice Section */}
        <div className={styles.lessonPlayer__practice}>
          <h3>Luyện tập:</h3>
          
          {/* Metronome */}
          <div className={styles.lessonPlayer__metronome}>
            <label>
              <input
                type="checkbox"
                checked={metronomeEnabled}
                onChange={(e) => setMetronomeEnabled(e.target.checked)}
              />
              Bật metronome
            </label>
            {metronomeEnabled && (
              <div className={styles.lessonPlayer__metronomeControls}>
                <label>
                  BPM:
                  <input
                    type="number"
                    value={metronomeBpm}
                    onChange={(e) => setMetronomeBpm(parseInt(e.target.value))}
                    min="60"
                    max="200"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Practice Checklist */}
          {practiceChecklist.length > 0 && (
            <div className={styles.lessonPlayer__checklist}>
              <h4>Checklist luyện tập:</h4>
              {practiceChecklist.map((item, index) => (
                <label key={index} className={styles.lessonPlayer__checklistItem}>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(index)}
                  />
                  <span className={item.completed ? styles.lessonPlayer__completed : ''}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Practice Log */}
          <div className={styles.lessonPlayer__practiceLog}>
            <h4>Ghi log luyện tập:</h4>
            <div className={styles.lessonPlayer__practiceForm}>
              <label>
                Thời gian (phút):
                <input
                  type="number"
                  value={practiceMinutes}
                  onChange={(e) => setPracticeMinutes(parseInt(e.target.value))}
                  min="1"
                />
              </label>
              <label>
                BPM:
                <input
                  type="number"
                  value={practiceBpm}
                  onChange={(e) => setPracticeBpm(parseInt(e.target.value))}
                  min="60"
                  max="200"
                />
              </label>
              <label>
                Ghi chú:
                <textarea
                  value={practiceNotes}
                  onChange={(e) => setPracticeNotes(e.target.value)}
                  placeholder="Ghi chú về buổi luyện tập..."
                />
              </label>
              <button
                onClick={handleLogPractice}
                disabled={practiceMinutes <= 0}
                className={styles.lessonPlayer__logButton}
              >
                Ghi log
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.lessonPlayer__actions}>
          {progress?.status !== 'completed' && (
            <button
              onClick={handleCompleteLesson}
              className={styles.lessonPlayer__completeButton}
            >
              Hoàn thành bài học
            </button>
          )}
          
          {nextLesson?.nextLesson && (
            <button
              onClick={handleNextLesson}
              className={styles.lessonPlayer__nextButton}
            >
              Bài học tiếp theo: {nextLesson.nextLesson.title}
            </button>
          )}
        </div>
      </div>

      {/* Metronome Component */}
      {metronomeEnabled && (
        <Metronome
          ref={metronomeRef}
          bpm={metronomeBpm}
          volume={0.5}
          isPlaying={false}
          onBpmChange={setMetronomeBpm}
          onVolumeChange={() => {}}
        />
      )}
    </div>
  );
}
