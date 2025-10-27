// src/components/Learning/VideoPlayer.jsx
import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import styles from './VideoPlayer.module.css';

/**
 * VideoPlayer Component
 * Video player với controls tùy chỉnh cho học guitar
 */
const VideoPlayer = forwardRef(({
  src,
  onTimeUpdate,
  onDurationChange,
  onPlayPause,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  onPlaybackRateChange
}, ref) => {
  const videoRef = useRef(null);
  const progressRef = useRef(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    currentTime: videoRef.current?.currentTime || 0,
    duration: videoRef.current?.duration || 0,
    playbackRate: videoRef.current?.playbackRate || 1
  }));

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      onTimeUpdate?.(video.currentTime);
    };

    const handleDurationChange = () => {
      onDurationChange?.(video.duration);
    };

    const handlePlay = () => {
      onPlayPause?.(true);
    };

    const handlePause = () => {
      onPlayPause?.(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onTimeUpdate, onDurationChange, onPlayPause]);

  // Update playback rate
  useEffect(() => {
    if (videoRef.current && playbackRate) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Handle play/pause
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
    }
  };

  // Handle playback rate change
  const handlePlaybackRateChange = (e) => {
    const rate = parseFloat(e.target.value);
    onPlaybackRateChange?.(rate);
  };

  // Format time
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.videoPlayer}>
      {/* Video Element */}
      <div className={styles.videoPlayer__container}>
        <video
          ref={videoRef}
          src={src}
          className={styles.videoPlayer__video}
          preload="metadata"
          playsInline
        />
        
        {/* Overlay Controls */}
        <div className={styles.videoPlayer__overlay}>
          <button
            onClick={handlePlayPause}
            className={styles.videoPlayer__playButton}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.videoPlayer__controls}>
        {/* Progress Bar */}
        <div className={styles.videoPlayer__progressContainer}>
          <div
            ref={progressRef}
            className={styles.videoPlayer__progressBar}
            onClick={handleProgressClick}
          >
            <div className={styles.videoPlayer__progressTrack}>
              <div
                className={styles.videoPlayer__progressFill}
                style={{ width: `${progressPercentage}%` }}
              />
              <div
                className={styles.videoPlayer__progressHandle}
                style={{ left: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Time Display */}
        <div className={styles.videoPlayer__timeDisplay}>
          <span className={styles.videoPlayer__currentTime}>
            {formatTime(currentTime)}
          </span>
          <span className={styles.videoPlayer__separator}>/</span>
          <span className={styles.videoPlayer__duration}>
            {formatTime(duration)}
          </span>
        </div>

        {/* Playback Rate */}
        <div className={styles.videoPlayer__playbackRate}>
          <label className={styles.videoPlayer__playbackRateLabel}>
            Tốc độ:
          </label>
          <select
            value={playbackRate}
            onChange={handlePlaybackRateChange}
            className={styles.videoPlayer__playbackRateSelect}
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;