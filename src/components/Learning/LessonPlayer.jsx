// src/components/Learning/LessonPlayer.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../services/courseService';
import VideoPlayer from './VideoPlayer';
import TabRenderer from './TabRenderer';
import Metronome from './Metronome';
import PracticeInterface from './PracticeInterface';
import styles from './LessonPlayer.module.css';

/**
 * LessonPlayer Component
 * Giao diện học bài tương tác với 3 vùng chính:
 * 1. Video hướng dẫn
 * 2. Bảng Tab/Hợp âm
 * 3. Khu vực luyện tập tương tác
 */
export default function LessonPlayer() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Metronome state
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(120);
  const [metronomeVolume, setMetronomeVolume] = useState(0.5);
  
  // Practice state
  const [practiceMode, setPracticeMode] = useState(false);
  const [highlightedTab, setHighlightedTab] = useState(null);
  const [practiceProgress, setPracticeProgress] = useState(0);
  
  // Refs
  const videoRef = useRef(null);
  const metronomeRef = useRef(null);
  const tabRendererRef = useRef(null);

  // Load course data
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getCourseById(courseId);
        if (response.success) {
          const courseData = response.data;
          setCourse(courseData);
          
          // Find current module
          const module = courseData.modules?.find(m => m._id === moduleId);
          if (module) {
            setCurrentModule(module);
            
            // Find current lesson
            const lesson = module.lessons?.find(l => l._id === lessonId);
            if (lesson) {
              setCurrentLesson(lesson);
            } else {
              setError('Không tìm thấy bài học');
            }
          } else {
            setError('Không tìm thấy module');
          }
        } else {
          setError(response.message || 'Có lỗi khi tải khóa học');
        }
      } catch (err) {
        console.error('Error loading course:', err);
        setError(err.message || 'Có lỗi khi tải khóa học');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && moduleId && lessonId) {
      loadCourse();
    }
  }, [courseId, moduleId, lessonId]);

  // Handle video time updates
  const handleTimeUpdate = useCallback((time) => {
    setCurrentTime(time);
    
    // Update highlighted tab based on current time
    if (currentLesson?.tabData && currentLesson.tabData.timeline) {
      const timeline = currentLesson.tabData.timeline;
      const currentTab = timeline.find(tab => 
        time >= tab.startTime && time <= tab.endTime
      );
      setHighlightedTab(currentTab || null);
    }
  }, [currentLesson]);

  // Handle video duration change
  const handleDurationChange = useCallback((dur) => {
    setDuration(dur);
  }, []);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Handle playback rate change
  const handlePlaybackRateChange = useCallback((rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  }, []);

  // Handle metronome toggle
  const handleMetronomeToggle = useCallback(() => {
    setMetronomeEnabled(!metronomeEnabled);
  }, [metronomeEnabled]);

  // Handle practice mode toggle
  const handlePracticeModeToggle = useCallback(() => {
    setPracticeMode(!practiceMode);
    if (!practiceMode) {
      // Start practice mode
      setMetronomeEnabled(true);
    }
  }, [practiceMode]);

  // Navigate to next lesson
  const handleNextLesson = useCallback(() => {
    if (currentModule && currentLesson) {
      const currentIndex = currentModule.lessons.findIndex(l => l._id === lessonId);
      if (currentIndex < currentModule.lessons.length - 1) {
        const nextLesson = currentModule.lessons[currentIndex + 1];
        navigate(`/learning/${courseId}/${moduleId}/${nextLesson._id}`);
      }
    }
  }, [currentModule, currentLesson, courseId, moduleId, lessonId, navigate]);

  // Navigate to previous lesson
  const handlePreviousLesson = useCallback(() => {
    if (currentModule && currentLesson) {
      const currentIndex = currentModule.lessons.findIndex(l => l._id === lessonId);
      if (currentIndex > 0) {
        const prevLesson = currentModule.lessons[currentIndex - 1];
        navigate(`/learning/${courseId}/${moduleId}/${prevLesson._id}`);
      }
    }
  }, [currentModule, currentLesson, courseId, moduleId, lessonId, navigate]);

  // Navigate back to course
  const handleBackToCourse = useCallback(() => {
    navigate(`/learning/${courseId}`);
  }, [courseId, navigate]);

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

  if (!course || !currentModule || !currentLesson) {
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
          <span className={styles.lessonPlayer__module}>{currentModule.title}</span>
          <span className={styles.lessonPlayer__separator}>/</span>
          <span className={styles.lessonPlayer__lesson}>{currentLesson.title}</span>
        </div>
        
        <div className={styles.lessonPlayer__controls}>
          <button
            onClick={handlePreviousLesson}
            className={styles.lessonPlayer__navButton}
            disabled={currentModule.lessons.findIndex(l => l._id === lessonId) === 0}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Trước
          </button>
          <button
            onClick={handleNextLesson}
            className={styles.lessonPlayer__navButton}
            disabled={currentModule.lessons.findIndex(l => l._id === lessonId) === currentModule.lessons.length - 1}
          >
            Sau
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.lessonPlayer__content}>
        {/* Video Section */}
        <div className={styles.lessonPlayer__videoSection}>
          <VideoPlayer
            ref={videoRef}
            src={currentLesson.videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onPlayPause={handlePlayPause}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            playbackRate={playbackRate}
            onPlaybackRateChange={handlePlaybackRateChange}
          />
        </div>

        {/* Tab/Chord Section */}
        <div className={styles.lessonPlayer__tabSection}>
          <TabRenderer
            ref={tabRendererRef}
            tabData={currentLesson.tabData}
            highlightedTab={highlightedTab}
            currentTime={currentTime}
            onTabClick={(tab) => {
              if (videoRef.current) {
                videoRef.current.currentTime = tab.startTime;
              }
            }}
          />
        </div>

        {/* Practice Section */}
        <div className={styles.lessonPlayer__practiceSection}>
          <PracticeInterface
            practiceMode={practiceMode}
            onPracticeModeToggle={handlePracticeModeToggle}
            metronomeEnabled={metronomeEnabled}
            onMetronomeToggle={handleMetronomeToggle}
            metronomeBpm={metronomeBpm}
            onMetronomeBpmChange={setMetronomeBpm}
            metronomeVolume={metronomeVolume}
            onMetronomeVolumeChange={setMetronomeVolume}
            tabData={currentLesson.tabData}
            highlightedTab={highlightedTab}
            practiceProgress={practiceProgress}
            onPracticeProgressChange={setPracticeProgress}
          />
        </div>
      </div>

      {/* Metronome */}
      {metronomeEnabled && (
        <Metronome
          ref={metronomeRef}
          bpm={metronomeBpm}
          volume={metronomeVolume}
          isPlaying={isPlaying}
          onBpmChange={setMetronomeBpm}
          onVolumeChange={setMetronomeVolume}
        />
      )}
    </div>
  );
}

