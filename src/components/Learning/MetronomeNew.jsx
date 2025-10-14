import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import styles from './Metronome.module.css';

/**
 * Metronome Component
 * Sử dụng Web Audio API để tạo âm thanh metronome
 */
const Metronome = forwardRef(({ bpm, volume, isPlaying, onBpmChange, onVolumeChange }, ref) => {
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const intervalRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Initialize audio context
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        
        // Create gain node for volume control
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = volume;
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

  // Update volume when prop changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Play metronome sound
  const playTick = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    try {
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Create oscillator for tick sound
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      // Configure oscillator (high frequency for tick)
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      oscillator.type = 'sine';

      // Configure gain for short tick
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(gainNodeRef.current);

      // Play tick
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.1);
    } catch (error) {
      console.error('Error playing metronome tick:', error);
    }
  };

  // Start metronome
  const start = () => {
    if (isPlayingRef.current) return;

    isPlayingRef.current = true;
    const interval = 60000 / bpm; // Convert BPM to milliseconds

    intervalRef.current = setInterval(playTick, interval);
  };

  // Stop metronome
  const stop = () => {
    if (!isPlayingRef.current) return;

    isPlayingRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Toggle metronome
  const toggle = () => {
    if (isPlayingRef.current) {
      stop();
    } else {
      start();
    }
  };

  // Update BPM
  const updateBpm = (newBpm) => {
    if (isPlayingRef.current) {
      stop();
      setTimeout(() => {
        start();
      }, 100);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    start,
    stop,
    toggle,
    isPlaying: () => isPlayingRef.current
  }));

  // Handle BPM changes
  useEffect(() => {
    if (isPlayingRef.current) {
      updateBpm(bpm);
    }
  }, [bpm]);

  // Handle play/pause from parent
  useEffect(() => {
    if (isPlaying && !isPlayingRef.current) {
      start();
    } else if (!isPlaying && isPlayingRef.current) {
      stop();
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return (
    <div className={styles.metronome}>
      <div className={styles.metronome__container}>
        <div className={styles.metronome__header}>
          <h3 className={styles.metronome__title}>Metronome</h3>
          <div className={styles.metronome__status}>
            {isPlayingRef.current ? (
              <span className={styles.metronome__playing}>🔴 Đang chạy</span>
            ) : (
              <span className={styles.metronome__stopped}>⏸️ Dừng</span>
            )}
          </div>
        </div>

        <div className={styles.metronome__controls}>
          {/* BPM Control */}
          <div className={styles.metronome__bpmControl}>
            <label className={styles.metronome__label}>
              BPM:
              <input
                type="number"
                value={bpm}
                onChange={(e) => onBpmChange(parseInt(e.target.value))}
                min="60"
                max="200"
                className={styles.metronome__bpmInput}
              />
            </label>
            <div className={styles.metronome__bpmButtons}>
              <button
                onClick={() => onBpmChange(Math.max(60, bpm - 5))}
                className={styles.metronome__bpmButton}
              >
                -5
              </button>
              <button
                onClick={() => onBpmChange(Math.min(200, bpm + 5))}
                className={styles.metronome__bpmButton}
              >
                +5
              </button>
            </div>
          </div>

          {/* Volume Control */}
          <div className={styles.metronome__volumeControl}>
            <label className={styles.metronome__label}>
              Âm lượng:
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className={styles.metronome__volumeSlider}
              />
              <span className={styles.metronome__volumeValue}>
                {Math.round(volume * 100)}%
              </span>
            </label>
          </div>

          {/* Play/Stop Button */}
          <div className={styles.metronome__playControl}>
            <button
              onClick={toggle}
              className={`${styles.metronome__playButton} ${
                isPlayingRef.current ? styles.metronome__playButtonActive : ''
              }`}
            >
              {isPlayingRef.current ? '⏸️ Dừng' : '▶️ Chạy'}
            </button>
          </div>
        </div>

        {/* Visual Indicator */}
        <div className={styles.metronome__visual}>
          <div className={styles.metronome__beat}>
            <div className={styles.metronome__beatIndicator}></div>
          </div>
        </div>
      </div>
    </div>
  );
});

Metronome.displayName = 'Metronome';

export default Metronome;
