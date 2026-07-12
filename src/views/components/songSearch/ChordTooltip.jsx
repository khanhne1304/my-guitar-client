import { useEffect, useState, useRef } from "react";
import styles from "./ChordTooltip.module.css";
import GuitarChordSVG from "../../../components/chords/GuitarChordSVG";

export default function ChordTooltip({
  chordText,
  children,
  forceVisible = false,
  trigger = "hover",
}) {
  const [hoverVisible, setHoverVisible] = useState(false);
  const [clickVisible, setClickVisible] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    placeAbove: true,
    align: "center",
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

  const isClickMode = trigger === "click";
  const popupVisible = forceVisible || (isClickMode ? clickVisible : hoverVisible);

  function handleEnter(e) {
    if (isClickMode) return;
    computeAndSetCoords(ref.current || e.currentTarget);
    setHoverVisible(true);
  }

  function handleLeave() {
    if (isClickMode) return;
    setHoverVisible(false);
  }

  function handleClick(e) {
    if (!isClickMode || forceVisible) return;
    e.stopPropagation();
    computeAndSetCoords(ref.current || e.currentTarget);
    setClickVisible((v) => !v);
  }

  useEffect(() => {
    if (!isClickMode || !clickVisible || forceVisible) return undefined;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setClickVisible(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [isClickMode, clickVisible, forceVisible]);

  useEffect(() => {
    if (forceVisible) return;
    const onResize = () => {
      if (popupVisible) computeAndSetCoords(ref.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [forceVisible, popupVisible]);

  return (
    <>
      <span
        ref={ref}
        role={isClickMode ? "button" : undefined}
        tabIndex={isClickMode ? 0 : undefined}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        onKeyDown={
          isClickMode
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(e);
                }
              }
            : undefined
        }
        className={`${styles.chord} ${isClickMode ? styles.chordClickable : ""}`}
      >
        {children}
      </span>
      {popupVisible &&
        (forceVisible ? (
          <div
            className={`${styles.chordTooltip} ${styles.chordTooltipDocked}`}
            style={{ position: "fixed", right: 20, bottom: 20, width: 180, zIndex: 9999 }}
          >
            <div className={styles.chordTooltipTitle}>{chord}</div>
            <GuitarChordSVG chord={chord} width={160} showTitle={false} />
          </div>
        ) : (
          <div
            className={`${styles.chordTooltip} ${coords.placeAbove ? styles.above : styles.below}`}
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
        ))}
    </>
  );
}
