import { useRef, useState } from 'react';
import { MAX_AUDIO_SIZE_MB } from '../../../../utils/audioFileValidation';
import styles from './AudioFileDropzone.module.css';

export default function AudioFileDropzone({
  label,
  title = 'Chọn hoặc kéo-thả file',
  subtitle = `MP3, WAV, WEBM, OGG, M4A • tối đa ${MAX_AUDIO_SIZE_MB} MB`,
  file,
  previewUrl,
  error,
  onFileSelect,
  disabled = false,
  inputRef: externalInputRef,
  children,
  showPreview = true,
}) {
  const internalRef = useRef(null);
  const inputRef = externalInputRef || internalRef;
  const [isDragging, setIsDragging] = useState(false);

  const pickFile = (incoming) => {
    if (disabled) return;
    onFileSelect(incoming || null);
    if (!incoming && inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    pickFile(e.dataTransfer.files?.[0] || null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className={styles.wrap}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dropActive : ''} ${disabled ? styles.disabled : ''}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className={styles.hiddenInput}
          disabled={disabled}
          onChange={(e) => pickFile(e.target.files?.[0] || null)}
        />
        <strong>{title}</strong>
        <span>{subtitle}</span>
        {file ? <span className={styles.fileMeta}>{file.name}</span> : null}
      </div>
      {children}
      {showPreview && previewUrl ? (
        <audio className={styles.audio} src={previewUrl} controls preload="metadata" />
      ) : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
