import { useState, useEffect, useRef, useMemo } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import ChordTooltip from "./ChordTooltip";
import styles from "../../../pages/songDetails/SongDetails.module.css";

export default function LyricsViewer({ lyrics, tempo }) {
  const [playing, setPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [tempoInput, setTempoInput] = useState(String(tempo || 90)); // ✅ lưu dưới dạng string
  const intervalRef = useRef(null);
<<<<<<< HEAD
  const currentChordIndexRef = useRef(-1);
=======
  const [currentChord, setCurrentChord] = useState("");
  const [stepsPerBeat, setStepsPerBeat] = useState(1);
>>>>>>> main

  // Convert tempoInput -> number an toàn (dùng useMemo để tránh parse mỗi lần render)
  const localTempo = useMemo(() => {
    const n = parseInt(tempoInput, 10);
    return isNaN(n) ? 90 : Math.max(40, Math.min(n, 240)); // clamp 40-240
  }, [tempoInput]);

  // Parse lyrics into atomic units: chords as a token, text split by character
  const parts = useMemo(() => {
    let result = [];
    let idx = 0;
    lyrics.split("\n").forEach((line) => {
      const chunks = line.split(/(\[.*?\])/g);
      chunks.forEach((chunk) => {
        if (!chunk) return;
        if (chunk.startsWith("[")) {
          result.push({ id: idx++, text: chunk, isChord: true });
        } else {
          for (const ch of chunk.split("")) {
            result.push({ id: idx++, text: ch, isChord: false });
          }
        }
      });
      result.push({ id: idx++, text: "\n", isChord: false });
    });
    return result;
  }, [lyrics]);

  // Timeline từng bước: char và chord
  const timeline = useMemo(() => {
    const steps = [];
    parts.forEach((p, pIdx) => {
      if (p.isChord) {
        const chordLabel = p.text.replace(/^\[|\]$/g, "");
        steps.push({ type: "chord", partIndex: pIdx, chord: chordLabel });
      } else if (p.text === "\n") {
        // skip newline khỏi bước
      } else {
        const chars = Array.from(p.text);
        chars.forEach((_, cIdx) => {
          steps.push({ type: "char", partIndex: pIdx, charIndex: cIdx });
        });
      }
    });
    return steps;
  }, [parts]);

  // Số ký tự đã highlight theo part
  const highlightProgressByPart = useMemo(() => {
    const progress = new Map();
    for (let i = 0; i <= stepIndex && i < timeline.length; i++) {
      const s = timeline[i];
      if (s.type === "char") {
        const prev = progress.get(s.partIndex) ?? -1;
        if (s.charIndex > prev) progress.set(s.partIndex, s.charIndex);
      }
    }
    return progress;
  }, [stepIndex, timeline]);

  // Chỉ hiển thị tooltip cho hợp âm đang hoạt động (mới nhất tính đến step hiện tại)
  const activeChordPartIndex = useMemo(() => {
    if (!timeline.length) return -1;
    const end = Math.min(stepIndex, timeline.length - 1);
    for (let i = end; i >= 0; i--) {
      const s = timeline[i];
      if (s.type === "chord") return s.partIndex;
    }
    return -1;
  }, [stepIndex, timeline]);

  function start() {
    if (stepIndex >= timeline.length - 1) {
      setStepIndex(0);
      setCurrentChord("");
    }
    setPlaying(true);
  }

  function stop() {
    setPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  useEffect(() => {
    if (!playing) return;

    const beatDuration = 60000 / (localTempo * Math.max(1, stepsPerBeat));
    let idx = stepIndex;

    intervalRef.current = setInterval(() => {
      idx = idx + 1;
      if (idx >= timeline.length) {
        setStepIndex(timeline.length - 1);
        setPlaying(false);
        clearInterval(intervalRef.current);
        return;
      }
      const step = timeline[idx];
      if (step.type === "chord") {
        setCurrentChord(step.chord);
      }
      setStepIndex(idx);
    }, beatDuration);

    return () => clearInterval(intervalRef.current);
  }, [playing, localTempo, stepsPerBeat, stepIndex, timeline]);

  // Track the latest chord index to trigger tooltip
  useEffect(() => {
    if (!playing) {
      currentChordIndexRef.current = -1;
      return;
    }
    // find nearest chord at or before highlightIndex
    for (let i = highlightIndex; i >= 0 && i < parts.length; i--) {
      if (parts[i].isChord) {
        currentChordIndexRef.current = i;
        break;
      }
    }
  }, [highlightIndex, parts, playing]);

  return (
    <div className={styles["song-details__lyricsWrapper"]}>
      {/* Tempo Control */}
      <div className={styles.tempoControl}>
        <label htmlFor="tempoInput" className={styles.tempoLabel}>
          Tempo:
        </label>
        <input
          id="tempoInput"
          type="number"
          min={40}
          max={240}
          value={tempoInput}
          onChange={(e) => setTempoInput(e.target.value)} // lưu raw string
          className={styles.tempoInput}
        />
        <span className={styles.tempoUnit}>BPM</span>
        <label htmlFor="spbInput" className={styles.tempoLabel} style={{ marginLeft: 8 }}>
          Steps/Beat:
        </label>
        <input
          id="spbInput"
          type="number"
          min={1}
          max={8}
          value={stepsPerBeat}
          onChange={(e) => setStepsPerBeat(Math.max(1, Math.min(8, Number(e.target.value || 1))))}
          className={styles.tempoInput}
        />
      </div>

      {/* Play/Stop */}
      <button onClick={playing ? stop : start} className={styles.playBtn}>
        {playing ? <FaStop /> : <FaPlay />} {" "}
        {playing ? "Dừng" : stepIndex > 0 ? "Tiếp tục" : "Phát"}
      </button>

      {/* Lyrics */}
      <div className={styles["song-details__lyrics"]}>
<<<<<<< HEAD
        {parts.map((p, i) => {
          const isActive = playing && i === currentChordIndexRef.current;
          if (p.isChord) {
            return (
              <ChordTooltip key={p.id} chordText={p.text} active={isActive}>
                <span
                  className={
                    i <= highlightIndex && playing
                      ? styles.highlight
                      : styles.lyricChord
                  }
                >
=======
        {parts.map((p, pIdx) => {
          if (p.isChord) {
            const isActive = playing && pIdx === activeChordPartIndex;
            return (
              <ChordTooltip key={p.id} chordText={p.text} forceVisible={isActive}>
                <span className={isActive ? styles.highlight : styles.lyricChord}>
>>>>>>> main
                  {p.text}
                </span>
              </ChordTooltip>
            );
          }
<<<<<<< HEAD
          if (p.text === "\n") {
            return <br key={p.id} />;
          }
          return (
            <span
              key={p.id}
              className={
                i <= highlightIndex && playing ? styles.highlight : playing ? styles.dimmed : ""
              }
            >
              {p.text}
=======

          if (p.text === "\n") {
            return <br key={p.id} />;
          }

          const chars = Array.from(p.text);
          const lastHighlighted = highlightProgressByPart.get(pIdx) ?? -1;
          return (
            <span key={p.id}>
              {chars.map((ch, cIdx) => (
                <span
                  key={cIdx}
                  className={
                    playing && cIdx <= lastHighlighted
                      ? `${styles.highlight} ${styles[`charC${(cIdx % 5) + 1}`]}`
                      : ""
                  }
                >
                  {ch}
                </span>
              ))}
>>>>>>> main
            </span>
          );
        })}
      </div>
    </div>
  );
}
