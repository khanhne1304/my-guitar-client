import SongAudioComparePanel from '../../../components/songSearch/SongAudioComparePanel';
import styles from './CompareTwoSongsPage.module.css';

export default function AiPracticeAudioSection() {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Luyện tập guitar</h2>
      <p className={styles.sectionHint}>
        Tải hoặc thu bản guitar của bạn — không cần chọn bài gốc.
      </p>
      <SongAudioComparePanel directMode />
    </section>
  );
}
