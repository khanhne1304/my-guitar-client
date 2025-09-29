import { useState, useRef } from "react";
import styles from "../../../pages/songDetails/SongDetails.module.css";
import GuitarChordSVG from "../../../../assets/SVG/guiarChord/GuitarChordSVG";

export default function ChordTooltip({ chordText, children }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    placeAbove: true,
    align: "center",
  });
  const ref = useRef(null);

  const chord = chordText.replace(/\[|\]/g, "").trim();

  function handleEnter(e) {
    const el = ref.current || e.currentTarget;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const tooltipWidth = 180;
    const tooltipHeight = 190;
    const gap = 10;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Tính vị trí trên/dưới
    const spaceAbove = rect.top;
    const spaceBelow = vh - rect.bottom;
    const placeAbove = spaceAbove > spaceBelow;
    const top = placeAbove ? rect.top - tooltipHeight - gap : rect.bottom + gap;

    // Tính căn giữa và clamp biên
    let left = rect.left + rect.width / 2;
    let align = "center";
    if (left - tooltipWidth / 2 < 8) {
      left = rect.left + 4;
      align = "left";
    } else if (left + tooltipWidth / 2 > vw - 8) {
      left = rect.right - 4;
      align = "right";
    }

    setCoords({ top, left, placeAbove, align });
    setVisible(true);
  }

  function handleLeave() {
    setVisible(false);
  }

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={styles["song-details__chord"]}
      >
        {children}
      </span>
      {visible && (
        <div
          className={`${styles.chordTooltip} ${
            coords.placeAbove ? styles.above : styles.below
          }`}
          style={{
            position: "fixed",
            top: coords.top,
            left:
              coords.align === "center"
                ? coords.left
                : coords.align === "left"
                ? coords.left
                : coords.left - 180,
            transform: coords.align === "center" ? "translateX(-50%)" : "none",
            width: 180,
            zIndex: 9999,
          }}
        >
          <div className={styles.chordTooltipTitle}>{chord}</div>
          <GuitarChordSVG chord={chord} width={160} showTitle={false} />
        </div>
      )}
    </>
  );
}
