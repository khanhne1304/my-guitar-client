import React, { useState, useEffect, useRef } from 'react';
import styles from './Metronome.module.css';

/**
 * Metronome Component
 * Metronome đơn giản với JS interval cho phép user luyện tập theo BPM
 */
const Metronome = ({ bpm = 120, onBpmChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBpm, setCurrentBpm] = useState(bpm);
  const [accent, setAccent] = useState(4); // 4/4 time
  const [beat, setBeat] = useState(0);
  
  const audioContextRef = useRef(null);
  const intervalRef = useRef(null);
  const oscillatorRef = useRef(null);

  useEffect(() => {
    // Initialize audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  useEffect(() => {
    if (onBpmChange) {
      onBpmChange(currentBpm);
    }
  }, [currentBpm, onBpmChange]);

  const playClick = (isAccent = false) => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for accent and regular beats
    oscillator.frequency.setValueAtTime(isAccent ? 1000 : 800, audioContext.currentTime);
    oscillator.type = 'sine';

    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(isAccent ? 0.3 : 0.2, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const startMetronome = () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setBeat(0);

    const interval = 60000 / currentBpm; // Convert BPM to milliseconds
    intervalRef.current = setInterval(() => {
      setBeat(prevBeat => {
        const newBeat = (prevBeat + 1) % accent;
        const isAccentBeat = newBeat === 0;
        playClick(isAccentBeat);
        return newBeat;
      });
    }, interval);
  };

  const stopMetronome = () => {
    if (!isPlaying) return;

    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setBeat(0);
  };

  const handleBpmChange = (newBpm) => {
    const clampedBpm = Math.max(40, Math.min(200, newBpm));
    setCurrentBpm(clampedBpm);
  };

  const handleAccentChange = (newAccent) => {
    setAccent(newAccent);
    setBeat(0);
  };

  const toggleMetronome = () => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.metronome}>
      <div className={styles.metronomeHeader}>
        <h3 className={styles.metronomeTitle}>🎵 Metronome</h3>
        <div className={styles.metronomeStatus}>
          {isPlaying ? (
            <span className={styles.playing}>Đang phát</span>
          ) : (
            <span className={styles.stopped}>Dừng</span>
          )}
        </div>
      </div>

      <div className={styles.metronomeControls}>
        {/* BPM Control */}
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>BPM: {currentBpm}</label>
          <div className={styles.bpmControl}>
            <button 
              onClick={() => handleBpmChange(currentBpm - 5)}
              className={styles.bpmButton}
              disabled={currentBpm <= 40}
            >
              -5
            </button>
            <button 
              onClick={() => handleBpmChange(currentBpm - 1)}
              className={styles.bpmButton}
              disabled={currentBpm <= 40}
            >
              -1
            </button>
            <input
              type="range"
              min="40"
              max="200"
              value={currentBpm}
              onChange={(e) => handleBpmChange(parseInt(e.target.value))}
              className={styles.bpmSlider}
            />
            <button 
              onClick={() => handleBpmChange(currentBpm + 1)}
              className={styles.bpmButton}
              disabled={currentBpm >= 200}
            >
              +1
            </button>
            <button 
              onClick={() => handleBpmChange(currentBpm + 5)}
              className={styles.bpmButton}
              disabled={currentBpm >= 200}
            >
              +5
            </button>
          </div>
        </div>

        {/* Time Signature */}
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Nhịp điệu</label>
          <div className={styles.accentControl}>
            {[2, 3, 4, 6, 8].map(value => (
              <button
                key={value}
                onClick={() => handleAccentChange(value)}
                className={`${styles.accentButton} ${accent === value ? styles.active : ''}`}
              >
                {value}/4
              </button>
            ))}
          </div>
        </div>

        {/* Play/Stop Button */}
        <div className={styles.controlGroup}>
          <button
            onClick={toggleMetronome}
            className={`${styles.playButton} ${isPlaying ? styles.stop : styles.play}`}
          >
            {isPlaying ? '⏹️ Dừng' : '▶️ Phát'}
          </button>
        </div>
      </div>

      {/* Visual Beat Indicator */}
      <div className={styles.beatIndicator}>
        <div className={styles.beatDots}>
          {Array.from({ length: accent }, (_, index) => (
            <div
              key={index}
              className={`${styles.beatDot} ${
                isPlaying && beat === index ? styles.active : ''
              } ${
                index === 0 ? styles.accent : ''
              }`}
            />
          ))}
        </div>
        <div className={styles.beatCounter}>
          Beat: {beat + 1}/{accent}
        </div>
      </div>

      {/* Preset BPMs */}
      <div className={styles.presetBpms}>
        <label className={styles.controlLabel}>BPM nhanh:</label>
        <div className={styles.presetButtons}>
          {[60, 80, 100, 120, 140, 160, 180].map(presetBpm => (
            <button
              key={presetBpm}
              onClick={() => handleBpmChange(presetBpm)}
              className={`${styles.presetButton} ${currentBpm === presetBpm ? styles.active : ''}`}
            >
              {presetBpm}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Metronome;
