import { useState, useRef } from "react";
import styles from "../../../pages/songDetails/SongDetails.module.css";
import GuitarChordSVG from "../../../assets/SVG/guiarChord/GuitarChordSVG";

export default function ChordTooltip({ chordText, children }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  const chord = chordText.replace(/\[|\]/g, "").trim();

  function handleEnter(e) {
    const el = ref.current || e.currentTarget;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tooltipWidth = 160;
    const tooltipHeight = 160;
    const padding = 8;

    let top = rect.top + window.scrollY - tooltipHeight - padding;
    let left = rect.left + window.scrollX;

    // Nếu không đủ chỗ phía trên, hiển thị phía dưới
    if (top < window.scrollY + 10) {
      top = rect.bottom + window.scrollY + padding;
    }

    // Điều chỉnh để không tràn phải
    const maxLeft = window.scrollX + window.innerWidth - tooltipWidth - 10;
    if (left > maxLeft) left = maxLeft;

    setPos({ top, left });
    setVisible(true);
  }

  function handleLeave() {
    setVisible(false);
  }

  return (
    <span
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={styles["song-details__chord"]}
    >
      {children}
      {visible && (
        <div
          className={styles.chordTooltip}
          style={{ top: pos.top, left: pos.left }}
        >
          <GuitarChordSVG chord={chord} width={150} showTitle />
        </div>
      )}
    </span>
  );
}


