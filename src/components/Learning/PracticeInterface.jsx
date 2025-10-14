// src/components/Learning/PracticeInterface.jsx
import { useState, useEffect, useRef } from 'react';
import styles from './PracticeInterface.module.css';

/**
 * PracticeInterface Component
 * Giao diện luyện tập tương tác với feedback
 */
export default function PracticeInterface({
  practiceMode,
  onPracticeModeToggle,
  metronomeEnabled,
  onMetronomeToggle,
  metronomeBpm,
  onMetronomeBpmChange,
  metronomeVolume,
  onMetronomeVolumeChange,
  tabData,
  highlightedTab,
  practiceProgress,
  onPracticeProgressChange
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [practiceStats, setPracticeStats] = useState({
    totalTime: 0,
    correctNotes: 0,
    totalNotes: 0,
    accuracy: 0
  });
  const [feedback, setFeedback] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseProgress, setExerciseProgress] = useState(0);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Initialize audio context for pitch detection
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    };

    initAudioContext();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Start/stop recording
  const handleRecordingToggle = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneRef.current = stream;
      
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
      }
      
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setFeedback(null);
      
      // Start pitch detection
      startPitchDetection();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setFeedback({
        type: 'error',
        message: 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.'
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (microphoneRef.current) {
      microphoneRef.current.getTracks().forEach(track => track.stop());
      microphoneRef.current = null;
    }
    
    setIsRecording(false);
    setRecordingStartTime(null);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  // Start pitch detection
  const startPitchDetection = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const detectPitch = () => {
      if (!isRecording) return;

      analyser.getByteFrequencyData(dataArray);
      
      // Simple pitch detection (find dominant frequency)
      let maxValue = 0;
      let maxIndex = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i];
          maxIndex = i;
        }
      }
      
      // Convert frequency bin to frequency
      const frequency = (maxIndex * audioContextRef.current.sampleRate) / (2 * bufferLength);
      
      // Check if frequency matches expected note
      if (highlightedTab && highlightedTab.expectedFrequency) {
        const expectedFreq = highlightedTab.expectedFrequency;
        const tolerance = 10; // Hz tolerance
        
        if (Math.abs(frequency - expectedFreq) <= tolerance) {
          setFeedback({
            type: 'success',
            message: 'Tuyệt vời! Bạn đã chơi đúng nốt.'
          });
          
          // Update practice stats
          setPracticeStats(prev => ({
            ...prev,
            correctNotes: prev.correctNotes + 1,
            totalNotes: prev.totalNotes + 1,
            accuracy: ((prev.correctNotes + 1) / (prev.totalNotes + 1)) * 100
          }));
        } else {
          setFeedback({
            type: 'warning',
            message: `Nốt hiện tại: ${frequency.toFixed(1)}Hz. Nốt mong đợi: ${expectedFreq}Hz`
          });
        }
      }
      
      requestAnimationFrame(detectPitch);
    };

    detectPitch();
  };

  // Handle practice mode toggle
  const handlePracticeModeToggle = () => {
    onPracticeModeToggle();
    
    if (!practiceMode) {
      // Starting practice mode
      setPracticeStats({
        totalTime: 0,
        correctNotes: 0,
        totalNotes: 0,
        accuracy: 0
      });
      setExerciseProgress(0);
    }
  };

  // Handle metronome toggle
  const handleMetronomeToggle = () => {
    onMetronomeToggle();
  };

  // Handle BPM change
  const handleBpmChange = (e) => {
    const newBpm = parseInt(e.target.value);
    onMetronomeBpmChange(newBpm);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    onMetronomeVolumeChange(newVolume);
  };

  // Start exercise
  const startExercise = () => {
    if (tabData && tabData.exercises && tabData.exercises.length > 0) {
      const exercise = tabData.exercises[0];
      setCurrentExercise(exercise);
      setExerciseProgress(0);
    }
  };

  // Complete exercise
  const completeExercise = () => {
    if (currentExercise) {
      setExerciseProgress(100);
      setFeedback({
        type: 'success',
        message: 'Chúc mừng! Bạn đã hoàn thành bài tập.'
      });
    }
  };

  // Reset practice
  const resetPractice = () => {
    setPracticeStats({
      totalTime: 0,
      correctNotes: 0,
      totalNotes: 0,
      accuracy: 0
    });
    setExerciseProgress(0);
    setCurrentExercise(null);
    setFeedback(null);
    stopRecording();
  };

  return (
    <div className={styles.practiceInterface}>
      <div className={styles.practiceInterface__header}>
        <h3 className={styles.practiceInterface__title}>Luyện tập</h3>
        <div className={styles.practiceInterface__status}>
          {practiceMode ? (
            <span className={styles.practiceInterface__statusActive}>Đang luyện tập</span>
          ) : (
            <span className={styles.practiceInterface__statusInactive}>Chưa bắt đầu</span>
          )}
        </div>
      </div>

      <div className={styles.practiceInterface__content}>
        {/* Practice Mode Toggle */}
        <div className={styles.practiceInterface__section}>
          <div className={styles.practiceInterface__toggle}>
            <button
              onClick={handlePracticeModeToggle}
              className={`${styles.practiceInterface__toggleButton} ${
                practiceMode ? styles.practiceInterface__toggleButtonActive : ''
              }`}
            >
              {practiceMode ? 'Dừng luyện tập' : 'Bắt đầu luyện tập'}
            </button>
          </div>
        </div>

        {/* Metronome Controls */}
        {practiceMode && (
          <div className={styles.practiceInterface__section}>
            <h4 className={styles.practiceInterface__sectionTitle}>Metronome</h4>
            <div className={styles.practiceInterface__metronomeControls}>
              <div className={styles.practiceInterface__control}>
                <label className={styles.practiceInterface__label}>
                  <input
                    type="checkbox"
                    checked={metronomeEnabled}
                    onChange={handleMetronomeToggle}
                    className={styles.practiceInterface__checkbox}
                  />
                  Bật metronome
                </label>
              </div>
              
              {metronomeEnabled && (
                <>
                  <div className={styles.practiceInterface__control}>
                    <label className={styles.practiceInterface__label}>
                      BPM: {metronomeBpm}
                    </label>
                    <input
                      type="range"
                      min="60"
                      max="200"
                      value={metronomeBpm}
                      onChange={handleBpmChange}
                      className={styles.practiceInterface__slider}
                    />
                  </div>
                  
                  <div className={styles.practiceInterface__control}>
                    <label className={styles.practiceInterface__label}>
                      Âm lượng: {Math.round(metronomeVolume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={metronomeVolume}
                      onChange={handleVolumeChange}
                      className={styles.practiceInterface__slider}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Recording Controls */}
        {practiceMode && (
          <div className={styles.practiceInterface__section}>
            <h4 className={styles.practiceInterface__sectionTitle}>Ghi âm & Phân tích</h4>
            <div className={styles.practiceInterface__recordingControls}>
              <button
                onClick={handleRecordingToggle}
                className={`${styles.practiceInterface__recordButton} ${
                  isRecording ? styles.practiceInterface__recordButtonActive : ''
                }`}
              >
                {isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
              </button>
              
              {isRecording && (
                <div className={styles.practiceInterface__recordingStatus}>
                  <div className={styles.practiceInterface__recordingIndicator} />
                  <span>Đang ghi âm...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`${styles.practiceInterface__feedback} ${
            styles[`practiceInterface__feedback${feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}`]
          }`}>
            <div className={styles.practiceInterface__feedbackIcon}>
              {feedback.type === 'success' && (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {feedback.type === 'warning' && (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.726-1.36 3.491 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {feedback.type === 'error' && (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className={styles.practiceInterface__feedbackMessage}>
              {feedback.message}
            </p>
          </div>
        )}

        {/* Practice Stats */}
        {practiceMode && (
          <div className={styles.practiceInterface__section}>
            <h4 className={styles.practiceInterface__sectionTitle}>Thống kê</h4>
            <div className={styles.practiceInterface__stats}>
              <div className={styles.practiceInterface__stat}>
                <span className={styles.practiceInterface__statLabel}>Độ chính xác:</span>
                <span className={styles.practiceInterface__statValue}>
                  {practiceStats.accuracy.toFixed(1)}%
                </span>
              </div>
              <div className={styles.practiceInterface__stat}>
                <span className={styles.practiceInterface__statLabel}>Nốt đúng:</span>
                <span className={styles.practiceInterface__statValue}>
                  {practiceStats.correctNotes}/{practiceStats.totalNotes}
                </span>
              </div>
              <div className={styles.practiceInterface__stat}>
                <span className={styles.practiceInterface__statLabel}>Thời gian:</span>
                <span className={styles.practiceInterface__statValue}>
                  {Math.floor(practiceStats.totalTime / 60)}:{(practiceStats.totalTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Exercise Progress */}
        {currentExercise && (
          <div className={styles.practiceInterface__section}>
            <h4 className={styles.practiceInterface__sectionTitle}>Tiến độ bài tập</h4>
            <div className={styles.practiceInterface__progress}>
              <div className={styles.practiceInterface__progressBar}>
                <div
                  className={styles.practiceInterface__progressFill}
                  style={{ width: `${exerciseProgress}%` }}
                />
              </div>
              <span className={styles.practiceInterface__progressText}>
                {exerciseProgress}%
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.practiceInterface__actions}>
          {practiceMode && (
            <button
              onClick={resetPractice}
              className={styles.practiceInterface__resetButton}
            >
              Làm lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

