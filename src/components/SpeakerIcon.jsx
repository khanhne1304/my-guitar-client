import React, { useState } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import styles from './SpeakerIcon.module.css';

const SpeakerIcon = ({ chordName, onPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault(); // Ngăn chặn navigation khi click vào icon
    e.stopPropagation(); // Ngăn chặn event bubbling
    
    if (isPlaying) return; // Ngăn chặn click nhiều lần
    
    setIsPlaying(true);
    
    try {
      await onPlay(chordName);
    } catch (error) {
      console.error('Error playing chord:', error);
    } finally {
      // Reset trạng thái sau 2 giây
      setTimeout(() => {
        setIsPlaying(false);
      }, 2000);
    }
  };

  return (
    <button 
      className={`${styles.speakerButton} ${isPlaying ? styles.playing : ''}`}
      onClick={handleClick}
      title={`Phát âm thanh hợp âm ${chordName}`}
    >
      {isPlaying ? <FaVolumeMute /> : <FaVolumeUp />}
    </button>
  );
};

export default SpeakerIcon;
