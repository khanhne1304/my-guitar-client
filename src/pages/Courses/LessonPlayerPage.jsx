import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../services/courseService';
import VideoPlayer from '../../components/Learning/VideoPlayer';
import TabRenderer from '../../components/Learning/TabRenderer';
import Metronome from '../../components/Learning/Metronome';
import PracticeArea from '../../components/Learning/PracticeArea';
import LessonNavigation from '../../components/Learning/LessonNavigation';
import styles from './LessonPlayerPage.module.css';

/**
 * LessonPlayerPage Component
 * Giao diện học bài tương tác với 3 vùng chính:
 * 1. Video hướng dẫn
 * 2. Bảng Tab/Hợp âm (render từ JSON → SVG/Canvas)
 * 3. Khu vực luyện tập tương tác
 */
export default function LessonPlayerPage() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const tabRendererRef = useRef(null);

  // Fetch course and lesson data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getCourseById(courseId);
        
        if (response.success) {
          const courseData = response.data;
          setCourse(courseData);

          // Find current module and lesson
          const module = courseData.modules?.find(m => m._id === moduleId);
          const lesson = module?.lessons?.find(l => l._id === lessonId);

          if (!module || !lesson) {
            setError('Không tìm thấy bài học');
            return;
          }

          setCurrentModule(module);
          setCurrentLesson(lesson);
        } else {
          setError(response.message || 'Không thể tải thông tin khóa học');
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err.message || 'Có lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && moduleId && lessonId) {
      fetchCourseData();
    }
  }, [courseId, moduleId, lessonId]);

  // Handle video time updates for tab synchronization
  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
    if (tabRendererRef.current) {
      tabRendererRef.current.highlightAtTime(time);
    }
  };

  // Handle video duration
  const handleDurationChange = (duration) => {
    setDuration(duration);
  };

  // Handle play/pause
  const handlePlayPause = (playing) => {
    setIsPlaying(playing);
  };

  // Navigate to next/previous lesson
  const navigateToLesson = (direction) => {
    if (!course || !currentModule) return;

    const allLessons = course.modules.flatMap(module => 
      module.lessons.map(lesson => ({
        ...lesson,
        moduleId: module._id,
        moduleTitle: module.title
      }))
    );

    const currentIndex = allLessons.findIndex(lesson => lesson._id === lessonId);
    
    if (direction === 'next' && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      navigate(`/learning/${courseId}/${nextLesson.moduleId}/${nextLesson._id}`);
    } else if (direction === 'prev' && currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      navigate(`/learning/${courseId}/${prevLesson.moduleId}/${prevLesson._id}`);
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={styles.lessonPlayer}>
      <div className={styles.lessonPlayer__container}>
        <div className={styles.lessonPlayer__header}>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        <div className={styles.lessonPlayer__content}>
          <div className={styles.lessonPlayer__videoSection}>
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
          
          <div className={styles.lessonPlayer__tabSection}>
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
          
          <div className={styles.lessonPlayer__practiceSection}>
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className={styles.lessonPlayer}>
        <div className={styles.lessonPlayer__container}>
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
            <button
              onClick={() => navigate('/learning')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!course || !currentModule || !currentLesson) {
    return (
      <div className={styles.lessonPlayer}>
        <div className={styles.lessonPlayer__container}>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài học</h2>
            <button
              onClick={() => navigate('/learning')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.lessonPlayer}>
      <div className={styles.lessonPlayer__container}>
        {/* Header */}
        <div className={styles.lessonPlayer__header}>
          <div className={styles.lessonPlayer__breadcrumb}>
            <button
              onClick={() => navigate('/learning')}
              className={styles.lessonPlayer__breadcrumbLink}
            >
              🎸 Học Guitar
            </button>
            <span className={styles.lessonPlayer__breadcrumbSeparator}>/</span>
            <span className={styles.lessonPlayer__breadcrumbCurrent}>
              {course.title}
            </span>
            <span className={styles.lessonPlayer__breadcrumbSeparator}>/</span>
            <span className={styles.lessonPlayer__breadcrumbCurrent}>
              {currentModule.title}
            </span>
            <span className={styles.lessonPlayer__breadcrumbSeparator}>/</span>
            <span className={styles.lessonPlayer__breadcrumbCurrent}>
              {currentLesson.title}
            </span>
          </div>

          <div className={styles.lessonPlayer__title}>
            <h1>{currentLesson.title}</h1>
            <div className={styles.lessonPlayer__meta}>
              <span className={`${styles.lessonPlayer__contentType} ${styles[`contentType${currentLesson.contentType?.charAt(0).toUpperCase() + currentLesson.contentType?.slice(1)}`]}`}>
                {currentLesson.contentType === 'note' ? '📝 Lý thuyết' :
                 currentLesson.contentType === 'chord' ? '🎵 Hợp âm' :
                 '🥁 Nhịp điệu'}
              </span>
              {currentLesson.duration && (
                <span className={styles.lessonPlayer__duration}>
                  ⏱️ {currentLesson.duration} phút
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - 3 Sections */}
        <div className={styles.lessonPlayer__content}>
          {/* 1. Video Section */}
          <div className={styles.lessonPlayer__videoSection}>
            <div className={styles.lessonPlayer__sectionHeader}>
              <h3>📹 Video Hướng Dẫn</h3>
              <div className={styles.lessonPlayer__controls}>
                <button
                  onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                  className={`${styles.lessonPlayer__controlButton} ${metronomeEnabled ? styles.active : ''}`}
                >
                  🎵 Metronome
                </button>
                <button
                  onClick={() => setPracticeMode(!practiceMode)}
                  className={`${styles.lessonPlayer__controlButton} ${practiceMode ? styles.active : ''}`}
                >
                  🎯 Luyện tập
                </button>
              </div>
            </div>
            
            <VideoPlayer
              ref={videoRef}
              src={currentLesson.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onPlayPause={handlePlayPause}
              className={styles.lessonPlayer__video}
            />
          </div>

          {/* 2. Tab/Chord Section */}
          <div className={styles.lessonPlayer__tabSection}>
            <div className={styles.lessonPlayer__sectionHeader}>
              <h3>
                {currentLesson.contentType === 'chord' ? '🎵 Hợp âm' :
                 currentLesson.contentType === 'rhythm' ? '🥁 Tab nhịp điệu' :
                 '📝 Tab lý thuyết'}
              </h3>
            </div>
            
            <TabRenderer
              ref={tabRendererRef}
              tabData={currentLesson.tabData}
              contentType={currentLesson.contentType}
              currentTime={currentTime}
              isPlaying={isPlaying}
              className={styles.lessonPlayer__tabRenderer}
            />
          </div>

          {/* 3. Practice Section */}
          <div className={styles.lessonPlayer__practiceSection}>
            <div className={styles.lessonPlayer__sectionHeader}>
              <h3>🎯 Khu Vực Luyện Tập</h3>
            </div>
            
            <PracticeArea
              lesson={currentLesson}
              metronomeEnabled={metronomeEnabled}
              practiceMode={practiceMode}
              onPracticeStart={() => setPracticeMode(true)}
              onPracticeStop={() => setPracticeMode(false)}
              className={styles.lessonPlayer__practiceArea}
            />
          </div>
        </div>

        {/* Metronome (if enabled) */}
        {metronomeEnabled && (
          <div className={styles.lessonPlayer__metronome}>
            <Metronome
              bpm={120}
              isPlaying={isPlaying}
              onBPMChange={(bpm) => console.log('BPM changed:', bpm)}
            />
          </div>
        )}

        {/* Lesson Navigation */}
        <LessonNavigation
          course={course}
          currentModule={currentModule}
          currentLesson={currentLesson}
          onNavigate={navigateToLesson}
          className={styles.lessonPlayer__navigation}
        />
      </div>
    </div>
  );
}
