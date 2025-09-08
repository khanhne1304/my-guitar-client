import { useState } from "react";
import GuitarChordSVG from "../../../assets/SVG/guiarChord/GuitarChordSVG";
import styles from "./LyricLine.module.css";

export default function LyricLine({ line }) {
  const [hoveredChord, setHoveredChord] = useState(null);

  const parts = line.split(/(\[.*?\])/g);

  return (
    <div className={styles.line}>
      {parts.map((part, idx) =>
        part.startsWith("[") ? (
          <span
            key={idx}
            className={styles.chord}
            onMouseEnter={() => setHoveredChord(part.replace(/\[|\]/g, ""))}
            onMouseLeave={() => setHoveredChord(null)}
          >
            {part}
            {hoveredChord === part.replace(/\[|\]/g, "") && (
              <div className={styles.chordPopup}>
                <GuitarChordSVG chord={hoveredChord} showTitle width={120} />
              </div>
            )}
          </span>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </div>
  );
}
