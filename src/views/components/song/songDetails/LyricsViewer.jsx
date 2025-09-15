import styles from "../../../pages/songDetails/SongDetails.module.css";
import ChordTooltip from "./ChordTooltip";
export default function LyricsViewer({ lyrics }) {
  return (
    <div className={styles["song-details__lyrics"]}>
      {lyrics.split("\n").map((line, i) => (
        <p key={i}>
          {line.split(/(\[.*?\])/g).map((part, j) =>
            part.startsWith("[") ? (
              <ChordTooltip key={j} chordText={part}>{part}</ChordTooltip>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      ))}
    </div>
  );
}
