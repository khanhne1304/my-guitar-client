import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './PracticeArea.module.css';

/**
 * PracticeArea Component
 * Khu vực luyện tập tương tác với metronome và feedback
 */
export default function PracticeArea({
  lesson,
  metronomeEnabled = false,
  practiceMode = false,
  onPracticeStart,
  onPracticeStop,
  className = '',
  ...props
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [practiceSession, setPracticeSession] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userProgress, setUserProgress] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [difficulty, setDifficulty] = useState('beginner');
  const [showHints, setShowHints] = useState(true);
  const [practiceStats, setPracticeStats] = useState({
    totalTime: 0,
    correctNotes: 0,
    totalNotes: 0,
    streak: 0,
    bestStreak: 0
  });

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const practiceStartTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize audio context for microphone input
  useEffect(() => {
    if (isRecording && typeof window !== 'undefined') {
      initializeAudioContext();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  // Initialize audio context
  const initializeAudioContext = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      startAudioAnalysis();
    } catch (error) {
      console.warn('Microphone access denied:', error);
      setFeedback({
        type: 'error',
        message: 'Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.'
      });
    }
  };

  // Start audio analysis for pitch detection
  const startAudioAnalysis = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!isRecording) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Simple pitch detection (in real app, use more sophisticated algorithm)
      const frequency = detectPitch(dataArray);
      if (frequency > 0) {
        checkAccuracy(frequency);
      }

      requestAnimationFrame(analyze);
    };

    analyze();
  };

  // Simple pitch detection (placeholder - in real app, use proper pitch detection)
  const detectPitch = (dataArray) => {
    let maxValue = 0;
    let maxIndex = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }
    
    return maxIndex * (audioContextRef.current?.sampleRate || 44100) / (dataArray.length * 2);
  };

  // Check accuracy against expected notes
  const checkAccuracy = (detectedFrequency) => {
    if (!lesson?.tabData) return;

    const expectedNotes = getExpectedNotes();
    const detectedNote = frequencyToNote(detectedFrequency);
    
    if (expectedNotes.length > 0) {
      const isCorrect = expectedNotes.some(note => 
        Math.abs(noteToFrequency(note) - detectedFrequency) < 50 // 50Hz tolerance
      );
      
      updateProgress(isCorrect, detectedNote);
    }
  };

  // Get expected notes from lesson data
  const getExpectedNotes = () => {
    if (!lesson?.tabData) return [];
    
    switch (lesson.contentType) {
      case 'chord':
        return lesson.tabData.chords?.map(chord => chord.chord) || [];
      case 'rhythm':
        return ['C', 'G', 'Am', 'F']; // Default chord progression
      default:
        return [];
    }
  };

  // Convert frequency to note name
  const frequencyToNote = (frequency) => {
    const A4 = 440;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const n = Math.round(12 * Math.log2(frequency / A4));
    return noteNames[n % 12];
  };

  // Convert note name to frequency
  const noteToFrequency = (note) => {
    const A4 = 440;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = noteNames.indexOf(note);
    return A4 * Math.pow(2, (noteIndex - 9) / 12);
  };

  // Update practice progress
  const updateProgress = (isCorrect, detectedNote) => {
    setUserProgress(prev => [...prev, {
      timestamp: Date.now(),
      isCorrect,
      detectedNote,
      expectedNotes: getExpectedNotes()
    }]);

    setPracticeStats(prev => ({
      ...prev,
      totalNotes: prev.totalNotes + 1,
      correctNotes: prev.correctNotes + (isCorrect ? 1 : 0),
      streak: isCorrect ? prev.streak + 1 : 0,
      bestStreak: Math.max(prev.bestStreak, isCorrect ? prev.streak + 1 : 0)
    }));

    setAccuracy(prev => {
      const newTotal = prev.totalNotes + 1;
      const newCorrect = prev.correctNotes + (isCorrect ? 1 : 0);
      return Math.round((newCorrect / newTotal) * 100);
    });

    setFeedback({
      type: isCorrect ? 'success' : 'error',
      message: isCorrect ? 
        `✅ Đúng! Phát hiện nốt ${detectedNote}` : 
        `❌ Sai! Phát hiện ${detectedNote}, cần ${getExpectedNotes().join(', ')}`
    });
  };

  // Start practice session
  const startPractice = () => {
    setIsRecording(true);
    setPracticeSession({
      startTime: Date.now(),
      lessonId: lesson._id,
      exercises: getPracticeExercises()
    });
    setUserProgress([]);
    setPracticeStats({
      totalTime: 0,
      correctNotes: 0,
      totalNotes: 0,
      streak: 0,
      bestStreak: 0
    });
    setFeedback(null);
    onPracticeStart?.();
  };

  // Stop practice session
  const stopPractice = () => {
    setIsRecording(false);
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onPracticeStop?.();
  };

  // Get practice exercises based on lesson content
  const getPracticeExercises = () => {
    if (!lesson?.tabData) return [];

    switch (lesson.contentType) {
      case 'chord':
        return lesson.tabData.chords?.map((chord, index) => ({
          id: index,
          type: 'chord',
          target: chord.chord,
          description: `Chơi hợp âm ${chord.chord}`,
          difficulty: difficulty
        })) || [];
      
      case 'rhythm':
        return lesson.tabData.patterns?.map((pattern, index) => ({
          id: index,
          type: 'rhythm',
          target: pattern.patterns,
          description: `Chơi nhịp điệu: ${pattern.patterns?.join(' ')}`,
          difficulty: difficulty
        })) || [];
      
      default:
        return [{
          id: 0,
          type: 'general',
          target: 'practice',
          description: 'Luyện tập chung',
          difficulty: difficulty
        }];
    }
  };

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setPracticeStats(prev => ({ ...prev, streak: 0 }));
  };

  // Handle tempo change
  const handleTempoChange = (newTempo) => {
    setTempo(newTempo);
  };

  // Get practice tips based on lesson content
  const getPracticeTips = () => {
    if (!lesson) return [];

    const tips = [];
    
    if (lesson.contentType === 'chord') {
      tips.push('Đảm bảo tất cả các nốt trong hợp âm phát ra rõ ràng');
      tips.push('Giữ tư thế tay thoải mái và chính xác');
      tips.push('Luyện tập chuyển đổi giữa các hợp âm một cách mượt mà');
    } else if (lesson.contentType === 'rhythm') {
      tips.push('Giữ nhịp đều đặn với metronome');
      tips.push('Chú ý đến accent (nhấn) trong nhịp điệu');
      tips.push('Bắt đầu chậm rồi tăng dần tốc độ');
    }

    return tips;
  };

  return (
    <div className={`${styles.practiceArea} ${className}`} {...props}>
      <div className={styles.practiceArea__header}>
        <h3>🎯 Khu Vực Luyện Tập</h3>
        <div className={styles.practiceArea__status}>
          {isRecording ? (
            <span className={styles.recordingIndicator}>
              🔴 Đang ghi âm
            </span>
          ) : (
            <span className={styles.readyIndicator}>
              ⚪ Sẵn sàng
            </span>
          )}
        </div>
      </div>

      <div className={styles.practiceArea__content}>
        {/* Practice Controls */}
        <div className={styles.practiceArea__controls}>
          <div className={styles.practiceArea__mainControls}>
            {!isRecording ? (
              <button
                onClick={startPractice}
                className={styles.practiceArea__startButton}
                disabled={!lesson}
              >
                🎵 Bắt đầu luyện tập
              </button>
            ) : (
              <button
                onClick={stopPractice}
                className={styles.practiceArea__stopButton}
              >
                ⏹️ Dừng luyện tập
              </button>
            )}
          </div>

          <div className={styles.practiceArea__settings}>
            <div className={styles.practiceArea__setting}>
              <label>Tốc độ:</label>
              <input
                type="range"
                min="60"
                max="200"
                value={tempo}
                onChange={(e) => handleTempoChange(parseInt(e.target.value))}
                className={styles.practiceArea__slider}
              />
              <span>{tempo} BPM</span>
            </div>

            <div className={styles.practiceArea__setting}>
              <label>Độ khó:</label>
              <select
                value={difficulty}
                onChange={(e) => handleDifficultyChange(e.target.value)}
                className={styles.practiceArea__select}
              >
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung bình</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>

            <div className={styles.practiceArea__setting}>
              <label>
                <input
                  type="checkbox"
                  checked={showHints}
                  onChange={(e) => setShowHints(e.target.checked)}
                />
                Hiển thị gợi ý
              </label>
            </div>
          </div>
        </div>

        {/* Practice Stats */}
        {isRecording && (
          <div className={styles.practiceArea__stats}>
            <div className={styles.practiceArea__stat}>
              <span className={styles.practiceArea__statLabel}>Độ chính xác:</span>
              <span className={styles.practiceArea__statValue}>{accuracy}%</span>
            </div>
            <div className={styles.practiceArea__stat}>
              <span className={styles.practiceArea__statLabel}>Chuỗi đúng:</span>
              <span className={styles.practiceArea__statValue}>{practiceStats.streak}</span>
            </div>
            <div className={styles.practiceArea__stat}>
              <span className={styles.practiceArea__statLabel}>Tổng nốt:</span>
              <span className={styles.practiceArea__statValue}>{practiceStats.totalNotes}</span>
            </div>
            <div className={styles.practiceArea__stat}>
              <span className={styles.practiceArea__statLabel}>Chuỗi tốt nhất:</span>
              <span className={styles.practiceArea__statValue}>{practiceStats.bestStreak}</span>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`${styles.practiceArea__feedback} ${styles[feedback.type]}`}>
            <div className={styles.practiceArea__feedbackMessage}>
              {feedback.message}
            </div>
          </div>
        )}

        {/* Practice Tips */}
        {showHints && (
          <div className={styles.practiceArea__tips}>
            <h4>💡 Mẹo luyện tập:</h4>
            <ul>
              {getPracticeTips().map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Metronome Integration */}
        {metronomeEnabled && (
          <div className={styles.practiceArea__metronome}>
            <h4>🎵 Metronome:</h4>
            <div className={styles.practiceArea__metronomeInfo}>
              <span>Tốc độ: {tempo} BPM</span>
              <span>Nhịp: 4/4</span>
              <span>Phách nhấn: 1</span>
            </div>
          </div>
        )}

        {/* Progress Visualization */}
        {userProgress.length > 0 && (
          <div className={styles.practiceArea__progress}>
            <h4>📊 Tiến độ:</h4>
            <div className={styles.practiceArea__progressChart}>
              {userProgress.slice(-20).map((entry, index) => (
                <div
                  key={index}
                  className={`${styles.practiceArea__progressBar} ${
                    entry.isCorrect ? styles.correct : styles.incorrect
                  }`}
                  title={`${entry.detectedNote} - ${entry.isCorrect ? 'Đúng' : 'Sai'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
