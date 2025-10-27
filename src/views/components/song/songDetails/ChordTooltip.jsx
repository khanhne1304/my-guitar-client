<<<<<<< HEAD
import { useState, useRef, useEffect } from "react";
import styles from "../../../pages/songDetails/SongDetails.module.css";
import GuitarChordSVG from "../../../../assets/SVG/guiarChord/GuitarChordSVG";

export default function ChordTooltip({ chordText, children, active = false }) {
  const [visible, setVisible] = useState(false);
=======
import { useEffect, useState, useRef } from "react";
import styles from "../../../pages/songDetails/SongDetails.module.css";
import GuitarChordSVG from "../../../../assets/SVG/guiarChord/GuitarChordSVG";

export default function ChordTooltip({ chordText, children, forceVisible = false }) {
  const [hoverVisible, setHoverVisible] = useState(false);
>>>>>>> main
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    side: "right",
  });
  const ref = useRef(null);

  const chord = chordText.replace(/\[|\]/g, "").trim();

  function computeAndSetCoords(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tooltipWidth = 180;
    const tooltipHeight = 190;
    const gap = 10;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

<<<<<<< HEAD
    // Đặt tooltip sang trái/phải để không che chữ
    const spaceRight = vw - rect.right;
    const spaceLeft = rect.left;
    const side = spaceRight >= tooltipWidth + gap || spaceRight >= spaceLeft ? "right" : "left";

    const topCenter = rect.top + rect.height / 2 - tooltipHeight / 2;
    const top = Math.max(8, Math.min(topCenter, vh - tooltipHeight - 8));
    const left = side === "right" ? rect.right + gap : rect.left - tooltipWidth - gap;

    setCoords({ top, left, side });
    setVisible(true);
=======
    const spaceAbove = rect.top;
    const spaceBelow = vh - rect.bottom;
    const placeAbove = spaceAbove > spaceBelow;
    const top = placeAbove ? rect.top - tooltipHeight - gap : rect.bottom + gap;

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
  }

  function handleEnter(e) {
    const el = ref.current || e.currentTarget;
    computeAndSetCoords(el);
    setHoverVisible(true);
>>>>>>> main
  }

  function handleLeave() {
    setHoverVisible(false);
  }

<<<<<<< HEAD
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
=======
  // Khi forceVisible bật: không cần tính toạ độ gần chữ (sẽ hiển thị dạng dock)
  useEffect(() => {
    if (forceVisible) return;
    // nếu không force, cập nhật toạ độ khi kích thước viewport thay đổi
    const onResize = () => {
      if (hoverVisible) computeAndSetCoords(ref.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [forceVisible, hoverVisible]);
>>>>>>> main

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
<<<<<<< HEAD
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
=======
      {(forceVisible || hoverVisible) && (
        forceVisible ? (
          <div className={`${styles.chordTooltip} ${styles.chordTooltipDocked}`}
            style={{ position: "fixed", right: 20, bottom: 20, width: 180, zIndex: 9999 }}>
            <div className={styles.chordTooltipTitle}>{chord}</div>
            <GuitarChordSVG chord={chord} width={160} showTitle={false} />
          </div>
        ) : (
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
        )
>>>>>>> main
      )}
    </>
  );
}
