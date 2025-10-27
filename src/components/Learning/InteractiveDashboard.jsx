import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseById } from '../../services/courseService';
import Metronome from './Metronome';
import PracticeInterface from './PracticeInterface';
import TabRenderer from './TabRenderer';
import ProgressTracker from './ProgressTracker';
import AchievementSystem from './AchievementSystem';
import styles from './InteractiveDashboard.module.css';

/**
 * InteractiveDashboard Component
 * Dashboard tương tác chính cho việc học guitar
 * Tích hợp tất cả các tính năng tương tác trong một giao diện
 */
export default function InteractiveDashboard() {
  const { courseId, moduleId, lessonId } = useParams();
  
  // State management
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive features state
  const [activeFeatures, setActiveFeatures] = useState({
    metronome: false,
    pitchDetection: false,
    realTimeFeedback: false,
    progressTracking: true,
    exercises: false,
    gamification: false
  });
  
  // Practice state
  const [practiceSession, setPracticeSession] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [userProgress, setUserProgress] = useState({
    accuracy: 0,
    streak: 0,
    totalTime: 0,
    exercisesCompleted: 0,
    achievements: []
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('practice');
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);

  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getCourseById(courseId);
        if (response.success) {
          const courseData = response.data;
          setCourse(courseData);
          
          // Find current lesson
          const module = courseData.modules?.find(m => m._id === moduleId);
          if (module) {
            const lesson = module.lessons?.find(l => l._id === lessonId);
            if (lesson) {
              setCurrentLesson(lesson);
              
              // Initialize interactive features based on lesson
              if (lesson.interactiveFeatures) {
                setActiveFeatures(prev => ({
                  ...prev,
                  metronome: lesson.interactiveFeatures.hasMetronome,
                  pitchDetection: lesson.interactiveFeatures.hasPitchDetection,
                  realTimeFeedback: lesson.interactiveFeatures.hasRealTimeFeedback,
                  exercises: lesson.interactiveFeatures.hasExercises,
                  gamification: lesson.interactiveFeatures.hasGamification
                }));
              }
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
      loadCourseData();
    }
  }, [courseId, moduleId, lessonId]);

  // Initialize audio context
  useEffect(() => {
    if (activeFeatures.pitchDetection && typeof window !== 'undefined') {
      initializeAudioContext();
    }
    
    return () => {
      if (microphoneRef.current) {
        microphoneRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [activeFeatures.pitchDetection]);

  const initializeAudioContext = async () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneRef.current = audioContext.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyser);
      
      startPitchDetection();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const startPitchDetection = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const detectPitch = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Simple pitch detection
      let maxValue = 0;
      let maxIndex = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i];
          maxIndex = i;
        }
      }
      
      const frequency = (maxIndex * audioContextRef.current.sampleRate) / (2 * bufferLength);
      
      // Update progress based on pitch detection
      if (frequency > 0 && currentLesson?.tabData?.expectedFrequency) {
        const expectedFreq = currentLesson.tabData.expectedFrequency;
        const tolerance = 20;
        
        if (Math.abs(frequency - expectedFreq) <= tolerance) {
          updateProgress({ accuracy: Math.min(100, userProgress.accuracy + 1) });
        }
      }
      
      requestAnimationFrame(detectPitch);
    };

    detectPitch();
  };

  // Start practice session
  const startPracticeSession = () => {
    const sessionId = Date.now().toString();
    const session = {
      id: sessionId,
      startTime: new Date(),
      lessonId,
      features: activeFeatures
    };
    
    setPracticeSession(session);
    setUserProgress(prev => ({ ...prev, totalTime: 0 }));
  };

  // End practice session
  const endPracticeSession = () => {
    if (practiceSession) {
      const duration = Math.round((new Date() - practiceSession.startTime) / 1000);
      setUserProgress(prev => ({ ...prev, totalTime: prev.totalTime + duration }));
      setPracticeSession(null);
    }
  };

  // Update user progress
  const updateProgress = (updates) => {
    setUserProgress(prev => ({
      ...prev,
      ...updates,
      streak: updates.accuracy > prev.accuracy ? prev.streak + 1 : 0
    }));
  };

  // Complete exercise
  const completeExercise = (exerciseData) => {
    setUserProgress(prev => ({
      ...prev,
      exercisesCompleted: prev.exercisesCompleted + 1,
      accuracy: Math.min(100, prev.accuracy + exerciseData.score)
    }));
    
    // Check for achievements
    checkAchievements();
  };

  // Check for new achievements
  const checkAchievements = () => {
    const newAchievements = [];
    
    if (userProgress.exercisesCompleted >= 10 && !userProgress.achievements.includes('first_10')) {
      newAchievements.push({
        id: 'first_10',
        name: 'Người học chăm chỉ',
        description: 'Hoàn thành 10 bài tập đầu tiên',
        points: 100
      });
    }
    
    if (userProgress.accuracy >= 90 && !userProgress.achievements.includes('accuracy_master')) {
      newAchievements.push({
        id: 'accuracy_master',
        name: 'Bậc thầy độ chính xác',
        description: 'Đạt độ chính xác 90%',
        points: 200
      });
    }
    
    if (userProgress.streak >= 5 && !userProgress.achievements.includes('streak_master')) {
      newAchievements.push({
        id: 'streak_master',
        name: 'Chuỗi thành công',
        description: 'Đạt chuỗi 5 lần liên tiếp',
        points: 150
      });
    }
    
    if (newAchievements.length > 0) {
      setUserProgress(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements]
      }));
    }
  };

  // Toggle feature
  const toggleFeature = (feature) => {
    setActiveFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboard__loading}>
          <div className={styles.dashboard__spinner}></div>
          <p>Đang tải dashboard tương tác...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboard__error}>
          <h2>Có lỗi xảy ra</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboard__error}>
          <h2>Không tìm thấy bài học</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.dashboard__header}>
        <div className={styles.dashboard__title}>
          <h1>🎸 {currentLesson.title}</h1>
          <p>{currentLesson.description}</p>
        </div>
        
        <div className={styles.dashboard__controls}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={styles.dashboard__settingsButton}
          >
            ⚙️ Cài đặt
          </button>
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className={styles.dashboard__achievementsButton}
          >
            🏆 Thành tích ({userProgress.achievements.length})
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={styles.dashboard__settings}>
          <h3>Tính năng tương tác</h3>
          <div className={styles.dashboard__featureToggles}>
            {Object.entries(activeFeatures).map(([feature, enabled]) => (
              <label key={feature} className={styles.dashboard__featureToggle}>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggleFeature(feature)}
                />
                <span>{getFeatureLabel(feature)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Panel */}
      {showAchievements && (
        <AchievementSystem
          achievements={userProgress.achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {/* Main Content */}
      <div className={styles.dashboard__content}>
        {/* Tabs */}
        <div className={styles.dashboard__tabs}>
          <button
            className={`${styles.dashboard__tab} ${activeTab === 'practice' ? styles.active : ''}`}
            onClick={() => setActiveTab('practice')}
          >
            🎵 Luyện tập
          </button>
          <button
            className={`${styles.dashboard__tab} ${activeTab === 'theory' ? styles.active : ''}`}
            onClick={() => setActiveTab('theory')}
          >
            📚 Lý thuyết
          </button>
          <button
            className={`${styles.dashboard__tab} ${activeTab === 'progress' ? styles.active : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            📊 Tiến độ
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.dashboard__tabContent}>
          {activeTab === 'practice' && (
            <div className={styles.dashboard__practiceSection}>
              {/* Practice Interface */}
              <PracticeInterface
                lesson={currentLesson}
                practiceMode={!!practiceSession}
                onPracticeStart={startPracticeSession}
                onPracticeStop={endPracticeSession}
                onExerciseComplete={completeExercise}
                metronomeEnabled={activeFeatures.metronome}
                pitchDetectionEnabled={activeFeatures.pitchDetection}
                realTimeFeedback={activeFeatures.realTimeFeedback}
              />

              {/* Metronome */}
              {activeFeatures.metronome && (
                <Metronome
                  bpm={currentLesson.practiceSettings?.defaultBpm || 120}
                  enabled={activeFeatures.metronome}
                />
              )}
            </div>
          )}

          {activeTab === 'theory' && (
            <div className={styles.dashboard__theorySection}>
              <TabRenderer
                tabData={currentLesson.tabData}
                interactive={true}
                showInstructions={true}
              />
            </div>
          )}

          {activeTab === 'progress' && (
            <ProgressTracker
              progress={userProgress}
              lesson={currentLesson}
              session={practiceSession}
            />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.dashboard__progressBar}>
        <div
          className={styles.dashboard__progressFill}
          style={{ width: `${userProgress.accuracy}%` }}
        />
        <span className={styles.dashboard__progressText}>
          Độ chính xác: {userProgress.accuracy}%
        </span>
      </div>
    </div>
  );
}

// Helper function to get feature labels
const getFeatureLabel = (feature) => {
  const labels = {
    metronome: 'Metronome',
    pitchDetection: 'Phát hiện cao độ',
    realTimeFeedback: 'Phản hồi thời gian thực',
    progressTracking: 'Theo dõi tiến độ',
    exercises: 'Bài tập tương tác',
    gamification: 'Hệ thống thành tích'
  };
  return labels[feature] || feature;
};



