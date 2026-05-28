import { useEffect, useState } from 'react';
import SongAudioComparePanel from '../../../components/songSearch/SongAudioComparePanel';
import styles from './CompareTwoSongsPage.module.css';

export default function AiPracticeAudioSection({ practiceSongs = [] }) {
  const [selectedUrl, setSelectedUrl] = useState(practiceSongs[0]?.url || '');

  useEffect(() => {
    if (practiceSongs.length && !practiceSongs.some((s) => s.url === selectedUrl)) {
      setSelectedUrl(practiceSongs[0].url);
    }
  }, [practiceSongs, selectedUrl]);

  const selectedSong =
    practiceSongs.find((s) => s.url === selectedUrl) || null;

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Luyện tập guitar</h2>
      <p className={styles.sectionHint}>
        Chọn bài từ Hợp âm chuẩn, tải hoặc thu bản guitar của bạn, rồi phân tích và so
        sánh hợp âm.
      </p>

      {practiceSongs.length > 0 ? (
        <div className={styles.practiceSelectRow}>
          <label className={styles.practiceSelectLabel} htmlFor="practice-song-select">
            Bài so sánh (Hợp âm chuẩn)
          </label>
          <select
            id="practice-song-select"
            className={styles.practiceSelect}
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
          >
            {practiceSongs.map((song) => (
              <option key={song.id} value={song.url}>
                {song.title}
                {song.artist ? ` — ${song.artist}` : ''}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className={styles.sectionHint}>
          Thêm bài từ kết quả tìm kiếm phía trên để so sánh hợp âm.
        </p>
      )}

      <SongAudioComparePanel
        directMode
        chordPracticeMode
        hopamSong={selectedSong}
      />
    </section>
  );
}
