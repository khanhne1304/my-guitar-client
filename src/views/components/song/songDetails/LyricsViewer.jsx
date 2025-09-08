import styles from "../../../pages/songDetails/SongDetails.module.css";
export default function LyricsViewer({ lyrics }) {
  return (
    <div className={styles["song-details__lyrics"]}>
      {lyrics.split("\n").map((line, i) => (
        <p key={i}>
          {line.split(/(\[.*?\])/g).map((part, j) =>
            part.startsWith("[") ? (
              <span key={j} className={styles["song-details__chord"]}>{part}</span>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      ))}
    </div>
  );
}
