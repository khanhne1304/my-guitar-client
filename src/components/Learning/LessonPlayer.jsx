import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { completeLesson, logPractice } from '../../services/progressService';
import Metronome from '../Tools/Metronome';
import styles from './LessonPlayer.module.css';

/**
 * LessonPlayer Component
 * Giao diện học bài với metronome, checklist và theo dõi tiến độ
 */
const LessonPlayer = () => {
  const { courseSlug, moduleOrder, lessonOrder } = useParams();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [isCompleted, setIsCompleted] = useState(false);
  const [practiceTime, setPracticeTime] = useState(0);
  const [checklist, setChecklist] = useState([]);
  const [showMetronome, setShowMetronome] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(120);
  
  const practiceStartTime = useRef(null);
  const practiceInterval = useRef(null);

  useEffect(() => {
    fetchLessonData();
    return () => {
      if (practiceInterval.current) {
        clearInterval(practiceInterval.current);
      }
    };
  }, [courseSlug, moduleOrder, lessonOrder]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lesson data from the course API
      const response = await apiClient.get(`/courses/${courseSlug}/lessons/${moduleOrder}.${lessonOrder}`);
      
      if (response.data.success) {
        const { course: courseData, module: moduleData, lesson: lessonData } = response.data.data;
        setCourse(courseData);
        setModule(moduleData);
        setLesson(lessonData);
        
        // Initialize checklist from lesson practice settings
        if (lessonData.practice?.checklist) {
          setChecklist(lessonData.practice.checklist.map(item => ({
            text: item,
            completed: false
          })));
        }
        
        // Set metronome BPM from lesson settings
        if (lessonData.practice?.metronomeBpm) {
          setMetronomeBpm(lessonData.practice.metronomeBpm);
        }
        
        // Check if lesson is already completed
        setIsCompleted(lessonData.userProgress?.isCompleted || false);
      } else {
        setError(response.data.message || 'Không thể tải bài học');
      }
    } catch (err) {
      console.error('Error fetching lesson data:', err);
      setError(err.response?.data?.message || 'Có lỗi khi tải bài học');
    } finally {
      setLoading(false);
    }
  };

  const startPractice = () => {
    if (!practiceStartTime.current) {
      practiceStartTime.current = Date.now();
      
      // Update practice time every minute
      practiceInterval.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - practiceStartTime.current) / 60000);
        setPracticeTime(elapsed);
      }, 60000);
    }
  };

  const stopPractice = async () => {
    if (practiceStartTime.current) {
      const elapsed = Math.floor((Date.now() - practiceStartTime.current) / 60000);
      setPracticeTime(prev => prev + elapsed);
      
      // Log practice session
      try {
        await logPractice(`${courseSlug}.${moduleOrder}.${lessonOrder}`, elapsed, metronomeBpm, 'Practice session completed');
      } catch (err) {
        console.error('Error logging practice:', err);
      }
      
      practiceStartTime.current = null;
      if (practiceInterval.current) {
        clearInterval(practiceInterval.current);
        practiceInterval.current = null;
      }
    }
  };

  const toggleChecklistItem = (index) => {
    setChecklist(prev => prev.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    ));
  };

  const completeLessonHandler = async () => {
    try {
      const allChecklistCompleted = checklist.every(item => item.completed);
      
      if (!allChecklistCompleted) {
        alert('Vui lòng hoàn thành tất cả các mục trong checklist trước khi đánh dấu hoàn thành bài học.');
        return;
      }

      await completeLesson(
        `${courseSlug}.${moduleOrder}.${lessonOrder}`,
        100, // score
        checklist.filter(item => item.completed).map(item => item.text) // acquired skills
      );
      
      setIsCompleted(true);
      
      // Show success message
      alert('Chúc mừng! Bạn đã hoàn thành bài học này.');
    } catch (err) {
      console.error('Error completing lesson:', err);
      alert('Có lỗi khi hoàn thành bài học. Vui lòng thử lại.');
    }
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const renderVideo = () => {
    if (!lesson?.content?.videoUrl) {
      return (
        <div className={styles.noContent}>
          <div className={styles.noContentIcon}>📹</div>
          <p>Không có video cho bài học này</p>
        </div>
      );
    }

    const youtubeId = extractYouTubeId(lesson.content.videoUrl);
    
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
          src={lesson.content.videoUrl}
          controls
          className={styles.video}
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      </div>
    );
  };

  const renderTabContent = () => {
    if (!lesson?.content?.tabs || lesson.content.tabs.length === 0) {
      return (
        <div className={styles.noContent}>
          <div className={styles.noContentIcon}>🎼</div>
          <p>Không có tab cho bài học này</p>
        </div>
      );
    }

    return (
      <div className={styles.tabContent}>
        {lesson.content.tabs.map((tab, index) => (
          <div key={index} className={styles.tabItem}>
            <h4>Tab {index + 1}</h4>
            <pre className={styles.tabText}>{tab}</pre>
          </div>
        ))}
      </div>
    );
  };

  const renderChords = () => {
    if (!lesson?.content?.chords || lesson.content.chords.length === 0) {
      return (
        <div className={styles.noContent}>
          <div className={styles.noContentIcon}>🎵</div>
          <p>Không có hợp âm cho bài học này</p>
        </div>
      );
    }

    return (
      <div className={styles.chordsContent}>
        <h4>Hợp âm trong bài học</h4>
        <div className={styles.chordsGrid}>
          {lesson.content.chords.map((chord, index) => (
            <div key={index} className={styles.chordCard}>
              <h5>{chord.name}</h5>
              {chord.fingering && (
                <div className={styles.chordFingering}>
                  <p>Thế bấm: {chord.fingering}</p>
                </div>
              )}
              <div className={`${styles.chordDifficulty} ${styles[`difficulty-${chord.difficulty}`]}`}>
                {chord.difficulty === 'easy' ? 'Dễ' : 
                 chord.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInstructions = () => {
    if (!lesson?.content?.text) {
      return (
        <div className={styles.noContent}>
          <div className={styles.noContentIcon}>📝</div>
          <p>Không có hướng dẫn cho bài học này</p>
        </div>
      );
    }

    return (
      <div className={styles.instructions}>
        <div dangerouslySetInnerHTML={{ 
          __html: lesson.content.text.replace(/\n/g, '<br>') 
        }} />
      </div>
    );
  };

  const renderStrumPattern = () => {
    if (!lesson?.content?.strumPattern) {
      return (
        <div className={styles.noContent}>
          <div className={styles.noContentIcon}>🥁</div>
          <p>Không có pattern tiết tấu cho bài học này</p>
        </div>
      );
    }

    return (
      <div className={styles.strumPattern}>
        <h4>Pattern tiết tấu</h4>
        <div className={styles.patternDisplay}>
          {lesson.content.strumPattern}
        </div>
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
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Lỗi tải bài học</h2>
        <p>{error}</p>
        <button onClick={fetchLessonData} className={styles.retryButton}>
          Thử lại
        </button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className={styles.error}>
        <div className={styles.errorIcon}>❌</div>
        <h2>Không tìm thấy bài học</h2>
        <p>Bài học không tồn tại hoặc đã bị xóa.</p>
        <Link to="/courses" className={styles.backButton}>
          Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.lessonPlayer}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/courses" className={styles.breadcrumbLink}>
          Khóa học
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link to={`/courses/${courseSlug}`} className={styles.breadcrumbLink}>
          {course?.title}
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{lesson.title}</span>
      </nav>

      {/* Lesson Header */}
      <div className={styles.lessonHeader}>
        <div className={styles.lessonInfo}>
          <h1 className={styles.lessonTitle}>{lesson.title}</h1>
          <p className={styles.lessonDescription}>
            {lesson.objectives && lesson.objectives.length > 0 && (
              <span>Mục tiêu: {lesson.objectives.join(', ')}</span>
            )}
          </p>
          <div className={styles.lessonMeta}>
            <span className={styles.lessonDuration}>
              ⏱️ {lesson.durationMin} phút
            </span>
            <span className={styles.lessonType}>
              🎵 {lesson.type === 'THEORY' ? 'Lý thuyết' :
                   lesson.type === 'CHORD' ? 'Hợp âm' :
                   lesson.type === 'STRUM' ? 'Tiết tấu' :
                   lesson.type === 'SONG' ? 'Bài hát' : 'Luyện tập'}
            </span>
            {lesson.skills && lesson.skills.length > 0 && (
              <span className={styles.lessonSkills}>
                🎯 {lesson.skills.join(', ')}
              </span>
            )}
          </div>
        </div>
        
        <div className={styles.lessonActions}>
          {!isCompleted ? (
            <button 
              onClick={completeLessonHandler}
              className={styles.completeButton}
              disabled={checklist.length > 0 && !checklist.every(item => item.completed)}
            >
              ✓ Hoàn thành bài học
            </button>
          ) : (
            <div className={styles.completedBadge}>
              ✓ Đã hoàn thành
            </div>
          )}
        </div>
      </div>

      {/* Practice Controls */}
      <div className={styles.practiceControls}>
        <div className={styles.practiceInfo}>
          <span className={styles.practiceTime}>
            Thời gian luyện tập: {practiceTime} phút
          </span>
          <div className={styles.practiceButtons}>
            <button 
              onClick={startPractice}
              className={styles.practiceButton}
              disabled={practiceStartTime.current !== null}
            >
              ▶️ Bắt đầu luyện tập
            </button>
            <button 
              onClick={stopPractice}
              className={styles.practiceButton}
              disabled={practiceStartTime.current === null}
            >
              ⏹️ Dừng luyện tập
            </button>
            <button 
              onClick={() => setShowMetronome(!showMetronome)}
              className={styles.metronomeToggle}
            >
              🎵 {showMetronome ? 'Ẩn' : 'Hiện'} Metronome
            </button>
          </div>
        </div>
      </div>

      {/* Metronome */}
      {showMetronome && (
        <div className={styles.metronomeSection}>
          <Metronome 
            bpm={metronomeBpm}
            onBpmChange={setMetronomeBpm}
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === 'content' ? styles.active : ''}`}
          onClick={() => setActiveTab('content')}
        >
          📚 Nội dung
        </button>
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
          className={`${styles.tabButton} ${activeTab === 'chords' ? styles.active : ''}`}
          onClick={() => setActiveTab('chords')}
        >
          🎵 Hợp âm
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'strum' ? styles.active : ''}`}
          onClick={() => setActiveTab('strum')}
        >
          🥁 Tiết tấu
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContentContainer}>
        {activeTab === 'content' && renderInstructions()}
        {activeTab === 'video' && renderVideo()}
        {activeTab === 'tab' && renderTabContent()}
        {activeTab === 'chords' && renderChords()}
        {activeTab === 'strum' && renderStrumPattern()}
      </div>

      {/* Practice Checklist */}
      {checklist.length > 0 && (
        <div className={styles.checklistSection}>
          <h3 className={styles.checklistTitle}>📋 Checklist luyện tập</h3>
          <div className={styles.checklist}>
            {checklist.map((item, index) => (
              <label key={index} className={styles.checklistItem}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem(index)}
                  className={styles.checklistCheckbox}
                />
                <span className={`${styles.checklistText} ${item.completed ? styles.completed : ''}`}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className={styles.navigation}>
        <Link to={`/courses/${courseSlug}`} className={styles.backButton}>
          ← Quay lại khóa học
        </Link>
        <div className={styles.navButtons}>
          <button 
            className={styles.prevButton}
            onClick={() => {
              const prevLesson = parseInt(lessonOrder) - 1;
              if (prevLesson > 0) {
                navigate(`/learning/${courseSlug}/lessons/${moduleOrder}.${prevLesson}`);
              }
            }}
          >
            ← Bài trước
          </button>
          <button 
            className={styles.nextButton}
            onClick={() => {
              const nextLesson = parseInt(lessonOrder) + 1;
              navigate(`/learning/${courseSlug}/lessons/${moduleOrder}.${nextLesson}`);
            }}
          >
            Bài tiếp theo →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;