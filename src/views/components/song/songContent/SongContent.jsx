import SongCard from "../../songCard/SongCard";
import styles from "./SongContent.module.css";

export default function SongContent({ loading, error, filtered }) {
  return (
    <main className={styles["songs-content"]}>
      {loading && <div className={styles["songs-content__stateHint"]}>Đang tải…</div>}
      {error && <div className={styles["songs-content__stateError"]}>{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className={styles["songs-content__stateHint"]}>
          Không có bài hát phù hợp.
        </div>
      )}

      <div className={styles["songs-content__list"]}>
        {filtered.map((s) => (
          <SongCard key={s.slug} song={s} />
        ))}
      </div>
    </main>
  );
}
