// src/components/Learning/Metronome.jsx
import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import styles from './Metronome.module.css';

/**
 * Metronome Component
 * Metronome đơn giản với highlight Tab theo thời gian
 */
const Metronome = forwardRef(({
  bpm = 120,
  volume = 0.5,
  isPlaying = false,
  onBpmChange,
  onVolumeChange
}, ref) => {
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const intervalRef = useRef(null);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [beatCount, setBeatCount] = useState(4);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    start: startMetronome,
    stop: stopMetronome,
    isPlaying: isMetronomePlaying
  }));

  // Initialize audio context
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
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

  // Create metronome sound
  const createMetronomeSound = () => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
  };

  // Start metronome
  const startMetronome = () => {
    if (isMetronomePlaying) return;

    setIsMetronomePlaying(true);
    setBeat(0);

    const interval = setInterval(() => {
      createMetronomeSound();
      setBeat(prevBeat => (prevBeat + 1) % beatCount);
    }, (60 / bpm) * 1000);

    intervalRef.current = interval;
  };

  // Stop metronome
  const stopMetronome = () => {
    if (!isMetronomePlaying) return;

    setIsMetronomePlaying(false);
    setBeat(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Handle BPM change
  const handleBpmChange = (e) => {
    const newBpm = parseInt(e.target.value);
    onBpmChange?.(newBpm);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange?.(newVolume);
  };

  // Handle play/pause toggle
  const handleToggle = () => {
    if (isMetronomePlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  // Handle beat count change
  const handleBeatCountChange = (e) => {
    const newBeatCount = parseInt(e.target.value);
    setBeatCount(newBeatCount);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMetronome();
    };
  }, []);

  // Update interval when BPM changes
  useEffect(() => {
    if (isMetronomePlaying && intervalRef.current) {
      stopMetronome();
      startMetronome();
    }
  }, [bpm]);

  return (
    <div className={styles.metronome}>
      <div className={styles.metronome__header}>
        <h3 className={styles.metronome__title}>Metronome</h3>
        <div className={styles.metronome__status}>
          <div className={`${styles.metronome__indicator} ${isMetronomePlaying ? styles.metronome__indicatorActive : ''}`}>
            {isMetronomePlaying ? 'Đang chạy' : 'Dừng'}
          </div>
        </div>
      </div>

      <div className={styles.metronome__content}>
        {/* Beat Display */}
        <div className={styles.metronome__beatDisplay}>
          <div className={styles.metronome__beatContainer}>
            {Array.from({ length: beatCount }, (_, index) => (
              <div
                key={index}
                className={`${styles.metronome__beat} ${
                  index === beat && isMetronomePlaying ? styles.metronome__beatActive : ''
                }`}
              />
            ))}
          </div>
          <div className={styles.metronome__beatText}>
            Beat {beat + 1} / {beatCount}
          </div>
        </div>

        {/* Controls */}
        <div className={styles.metronome__controls}>
          {/* Play/Pause Button */}
          <button
            onClick={handleToggle}
            className={`${styles.metronome__playButton} ${
              isMetronomePlaying ? styles.metronome__playButtonActive : ''
            }`}
          >
            {isMetronomePlaying ? (
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* BPM Control */}
          <div className={styles.metronome__bpmControl}>
            <label className={styles.metronome__label}>
              BPM: {bpm}
            </label>
            <input
              type="range"
              min="60"
              max="200"
              value={bpm}
              onChange={handleBpmChange}
              className={styles.metronome__slider}
            />
            <div className={styles.metronome__bpmPresets}>
              <button
                onClick={() => onBpmChange?.(60)}
                className={styles.metronome__presetButton}
              >
                60
              </button>
              <button
                onClick={() => onBpmChange?.(80)}
                className={styles.metronome__presetButton}
              >
                80
              </button>
              <button
                onClick={() => onBpmChange?.(120)}
                className={styles.metronome__presetButton}
              >
                120
              </button>
              <button
                onClick={() => onBpmChange?.(140)}
                className={styles.metronome__presetButton}
              >
                140
              </button>
            </div>
          </div>

          {/* Volume Control */}
          <div className={styles.metronome__volumeControl}>
            <label className={styles.metronome__label}>
              Âm lượng: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className={styles.metronome__slider}
            />
          </div>

          {/* Beat Count Control */}
          <div className={styles.metronome__beatCountControl}>
            <label className={styles.metronome__label}>
              Số beat: {beatCount}
            </label>
            <select
              value={beatCount}
              onChange={handleBeatCountChange}
              className={styles.metronome__select}
            >
              <option value={2}>2/4</option>
              <option value={3}>3/4</option>
              <option value={4}>4/4</option>
              <option value={6}>6/8</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
});

Metronome.displayName = 'Metronome';

export default Metronome;