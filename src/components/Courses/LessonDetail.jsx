import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import styles from './LessonDetail.module.css';

const LessonDetail = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [isCompleted, setIsCompleted] = useState(false);
  const [practiceTime, setPracticeTime] = useState(0);

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/lessons/${id}`);
      setLesson(response.data.data);
      setIsCompleted(response.data.data.userProgress?.isCompleted || false);
    } catch (err) {
      setError('Không thể tải bài học');
      console.error('Error fetching lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async () => {
    try {
      await apiClient.patch(`/lessons/${id}/complete`);
      setIsCompleted(true);
    } catch (err) {
      console.error('Error marking lesson as completed:', err);
    }
  };

  const addPracticeTime = async (minutes) => {
    try {
      await apiClient.post(`/lessons/${id}/practice`, { minutes });
      setPracticeTime(prev => prev + minutes);
    } catch (err) {
      console.error('Error adding practice time:', err);
    }
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const renderVideo = () => {
    if (!lesson.videoUrl) {
      return (
        <div className={styles.noVideo}>
          <p>Không có video cho bài học này</p>
        </div>
      );
    }

    const youtubeId = extractYouTubeId(lesson.videoUrl);
    
    if (youtubeId) {
      return (
        <div className={styles.videoContainer}>
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={lesson.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.video}
          ></iframe>
        </div>
      );
    }

    return (
      <div className={styles.videoContainer}>
        <video
          src={lesson.videoUrl}
          controls
          className={styles.video}
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      </div>
    );
  };

  const renderTabContent = () => {
    if (!lesson.tabContent) {
      return (
        <div className={styles.noContent}>
          <p>Không có tab cho bài học này</p>
        </div>
      );
    }

    return (
      <div className={styles.tabContent}>
        <pre className={styles.tabText}>{lesson.tabContent}</pre>
      </div>
    );
  };

  const renderInstructions = () => {
    if (!lesson.instructions) {
      return (
        <div className={styles.noContent}>
          <p>Không có hướng dẫn cho bài học này</p>
        </div>
      );
    }

    return (
      <div className={styles.instructions}>
        <div dangerouslySetInnerHTML={{ __html: lesson.instructions.replace(/\n/g, '<br>') }} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải bài học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Lỗi tải bài học</h2>
        <p>{error}</p>
        <button onClick={fetchLesson} className={styles.retryButton}>
          Thử lại
        </button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className={styles.error}>
        <h2>Không tìm thấy bài học</h2>
        <p>Bài học không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }

  return (
    <div className={styles.lessonContainer}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/courses" className={styles.breadcrumbLink}>
          Khóa học
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link to="/courses/basic-guitar" className={styles.breadcrumbLink}>
          {lesson.course?.title}
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{lesson.lesson.title}</span>
      </nav>

      {/* Lesson Header */}
      <div className={styles.lessonHeader}>
        <div className={styles.lessonInfo}>
          <h1 className={styles.lessonTitle}>{lesson.lesson.title}</h1>
          <p className={styles.lessonDescription}>{lesson.lesson.description}</p>
          <div className={styles.lessonMeta}>
            <span className={styles.lessonDuration}>
              ⏱️ {lesson.lesson.practiceSettings?.estimatedDuration || 15} phút
            </span>
            <span className={styles.lessonDifficulty}>
              📊 {lesson.lesson.practiceSettings?.difficulty || 'beginner'}
            </span>
            <span className={styles.lessonType}>
              🎵 {lesson.lesson.contentType || 'note'}
            </span>
          </div>
        </div>
        <div className={styles.lessonActions}>
          {!isCompleted && (
            <button 
              onClick={markAsCompleted}
              className={styles.completeButton}
            >
              ✓ Đánh dấu hoàn thành
            </button>
          )}
          {isCompleted && (
            <div className={styles.completedBadge}>
              ✓ Đã hoàn thành
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === 'video' ? styles.active : ''}`}
          onClick={() => setActiveTab('video')}
        >
          📹 Video
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'tab' ? styles.active : ''}`}
          onClick={() => setActiveTab('tab')}
        >
          🎼 Tab/Sheet
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'instructions' ? styles.active : ''}`}
          onClick={() => setActiveTab('instructions')}
        >
          📝 Hướng dẫn
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContentContainer}>
        {activeTab === 'video' && renderVideo()}
        {activeTab === 'tab' && renderTabContent()}
        {activeTab === 'instructions' && renderInstructions()}
      </div>

      {/* Practice Tools */}
      <div className={styles.practiceTools}>
        <h3 className={styles.practiceTitle}>Công cụ luyện tập</h3>
        <div className={styles.toolsGrid}>
          <div className={styles.tool}>
            <h4>⏱️ Thời gian luyện tập</h4>
            <p>Thời gian đã luyện: {practiceTime} phút</p>
            <div className={styles.timeButtons}>
              <button 
                onClick={() => addPracticeTime(5)}
                className={styles.timeButton}
              >
                +5 phút
              </button>
              <button 
                onClick={() => addPracticeTime(15)}
                className={styles.timeButton}
              >
                +15 phút
              </button>
              <button 
                onClick={() => addPracticeTime(30)}
                className={styles.timeButton}
              >
                +30 phút
              </button>
            </div>
          </div>
          
          <div className={styles.tool}>
            <h4>🎵 Metronome</h4>
            <p>Luyện tập với nhịp điệu</p>
            <button className={styles.metronomeButton}>
              Bật Metronome
            </button>
          </div>
          
          <div className={styles.tool}>
            <h4>📊 Tiến độ</h4>
            <p>Theo dõi quá trình học tập</p>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: isCompleted ? '100%' : '50%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <Link to="/courses/basic-guitar" className={styles.backButton}>
          ← Quay lại khóa học
        </Link>
        <div className={styles.navButtons}>
          <button className={styles.prevButton}>
            ← Bài trước
          </button>
          <button className={styles.nextButton}>
            Bài tiếp theo →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
