import { useEffect, useState } from 'react';
import { aiPracticeService } from '../../../../services/aiPracticeService';
import styles from './AudioSelector.module.css';

const LEVEL_LABELS = {
  0: 'Người mới',
  1: 'Trung cấp',
  2: 'Nâng cao',
};

const formatDate = (dateString) => {
  if (!dateString) return 'Không xác định';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AudioSelector({ onSelectAudio, selectedAudioId, onClose }) {
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterLesson, setFilterLesson] = useState('');

  useEffect(() => {
    loadAudios();
  }, [filterLesson]);

  const loadAudios = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filterLesson) params.lessonId = filterLesson;
      const result = await aiPracticeService.fetchAudioFiles({ ...params, includeMetadata: 'true' });
      setAudios(result?.data?.audios || []);
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách audio.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (audio) => {
    if (onSelectAudio) {
      onSelectAudio(audio);
    }
    if (onClose) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loading}>Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Chọn âm thanh đã upload</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Lọc theo lesson ID..."
            value={filterLesson}
            onChange={(e) => setFilterLesson(e.target.value)}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.list}>
          {audios.length === 0 ? (
            <div className={styles.empty}>
              <p>Chưa có audio nào được upload.</p>
              <p className={styles.emptyHint}>Hãy upload file audio để bắt đầu.</p>
            </div>
          ) : (
            audios.map((audio) => (
              <div
                key={audio.id}
                className={`${styles.audioItem} ${selectedAudioId === audio.id ? styles.selected : ''}`}
                onClick={() => handleSelect(audio)}
              >
                <div className={styles.audioInfo}>
                  <div className={styles.audioHeader}>
                    <strong className={styles.audioName}>
                      {audio.originalFilename || 'Không có tên'}
                    </strong>
                    {audio.overallScore > 0 && (
                      <span className={styles.score}>{audio.overallScore.toFixed(0)}</span>
                    )}
                  </div>
                  <div className={styles.audioMeta}>
                    <span className={styles.metaItem}>
                      {formatDate(audio.uploadedAt)}
                    </span>
                    {audio.lessonTitle && (
                      <span className={styles.metaItem}>{audio.lessonTitle}</span>
                    )}
                    {audio.level && (
                      <span className={styles.metaItem}>
                        {LEVEL_LABELS[audio.levelClass] || audio.level}
                      </span>
                    )}
                    {audio.metadata?.size && (
                      <span className={styles.metaItem}>
                        {formatFileSize(audio.metadata.size)}
                      </span>
                    )}
                  </div>
                  {audio.cloudinaryUrl && (
                    <audio
                      src={audio.cloudinaryUrl}
                      controls
                      preload="metadata"
                      className={styles.audioPlayer}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
                <button
                  className={styles.selectBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(audio);
                  }}
                >
                  Chọn
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

