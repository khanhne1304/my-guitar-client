import GuitarChordSVG from "../../../../assets/SVG/guiarChord/GuitarChordSVG";
import styles from "../../../pages/songDetails/SongDetails.module.css";
export default function ChordList({ chords }) {
  if (!chords || chords.length === 0) return null;

  return (
    <div className={styles["song-details__chords"]}>
      <h2 className={styles["song-details__chordsTitle"]}>Danh sách hợp âm sử dụng trong bài</h2>
      <div className={styles["song-details__chordsGrid"]}>
        {chords.map((ch) => (
          <div key={ch} className={styles["song-details__chordItem"]}>
            <div className={styles["song-details__chordName"]}>{ch}</div>
            <GuitarChordSVG chord={ch} width={140} showTitle={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
