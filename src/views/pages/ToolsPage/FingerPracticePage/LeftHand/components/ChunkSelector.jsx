import styles from "./ChunkSelector.module.css";

export default function ChunkSelector({ chunks, selectedChunk, onSelectChunk }) {
  if (!chunks || chunks.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.chunkSelector}>
      <h3 className={styles.sectionTitle}>Luyện tập theo đoạn (Chunk Mode)</h3>
      <div className={styles.chunksList}>
        <button
          className={`${styles.chunkButton} ${!selectedChunk ? styles.active : ""}`}
          onClick={() => onSelectChunk(null)}
        >
          Toàn bộ bài
        </button>
        {chunks.map((chunk, idx) => (
          <button
            key={idx}
            className={`${styles.chunkButton} ${
              selectedChunk?.start === chunk.start && selectedChunk?.end === chunk.end
                ? styles.active
                : ""
            }`}
            onClick={() => onSelectChunk(chunk)}
          >
            {chunk.name || `Đoạn ${idx + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
}

