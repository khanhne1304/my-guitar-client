import { useState, useRef, useEffect } from "react";
import styles from "../../../pages/songDetails/SongDetails.module.css";
import GuitarChordSVG from "../../../../assets/SVG/guiarChord/GuitarChordSVG";

export default function ChordTooltip({ chordText, children, active = false }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    side: "right",
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

    // Đặt tooltip sang trái/phải để không che chữ
    const spaceRight = vw - rect.right;
    const spaceLeft = rect.left;
    const side = spaceRight >= tooltipWidth + gap || spaceRight >= spaceLeft ? "right" : "left";

    const topCenter = rect.top + rect.height / 2 - tooltipHeight / 2;
    const top = Math.max(8, Math.min(topCenter, vh - tooltipHeight - 8));
    const left = side === "right" ? rect.right + gap : rect.left - tooltipWidth - gap;

    setCoords({ top, left, side });
    setVisible(true);
  }

  function handleLeave() {
    setVisible(false);
  }

  // Programmatically show tooltip when active
  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const tooltipWidth = 180;
    const tooltipHeight = 190;
    const gap = 10;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceRight = vw - rect.right;
    const spaceLeft = rect.left;
    const side = spaceRight >= tooltipWidth + gap || spaceRight >= spaceLeft ? "right" : "left";

    const topCenter = rect.top + rect.height / 2 - tooltipHeight / 2;
    const top = Math.max(8, Math.min(topCenter, vh - tooltipHeight - 8));
    const left = side === "right" ? rect.right + gap : rect.left - tooltipWidth - gap;

    setCoords({ top, left, side });
    setVisible(true);
  }, [active]);

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
          className={styles.chordTooltip}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: 180,
            height: 190,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <div className={styles.chordTooltipTitle}>{chord}</div>
          <GuitarChordSVG chord={chord} width={160} showTitle={false} />
        </div>
      )}
    </>
  );
}
