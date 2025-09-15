import { useState, useRef } from "react";
import styles from "../../../pages/songDetails/SongDetails.module.css";
import GuitarChordSVG from "../../../../assets/SVG/guiarChord/GuitarChordSVG";

export default function ChordTooltip({ chordText, children }) {
  const [visible, setVisible] = useState(false);
  const [placeAbove, setPlaceAbove] = useState(true);
  const [align, setAlign] = useState("center"); // center | left | right
  const ref = useRef(null);

  const chord = chordText.replace(/\[|\]/g, "").trim();

  function handleEnter(e) {
    const el = ref.current || e.currentTarget;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tooltipHeight = 190;
    const gap = 10;
    // Nếu không đủ chỗ phía trên thì hiển thị phía dưới
    const aboveTop = rect.top - tooltipHeight - gap;
    setPlaceAbove(aboveTop >= 10);

    // Căn giữa nhưng clamp hai biên màn hình
    const tooltipWidth = 180;
    const centerLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    const vw = window.innerWidth;
    if (centerLeft < 8) setAlign("left");
    else if (centerLeft + tooltipWidth > vw - 8) setAlign("right");
    else setAlign("center");
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
          className={`${styles.chordTooltip} ${placeAbove ? styles.above : styles.below} ${
            align === "left" ? styles.alignLeft : align === "right" ? styles.alignRight : styles.alignCenter
          }`}
          style={{ "--gap": "10px" }}
        >
          <div className={styles.chordTooltipTitle}>{chord}</div>
          <GuitarChordSVG chord={chord} width={160} showTitle={false} />
        </div>
      )}
    </span>
  );
}


