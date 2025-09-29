import { useState, useEffect, useRef, useMemo } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import ChordTooltip from "./ChordTooltip";
import styles from "../../../pages/songDetails/SongDetails.module.css";

export default function LyricsViewer({ lyrics, tempo }) {
  const [playing, setPlaying] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [tempoInput, setTempoInput] = useState(String(tempo || 90)); // ✅ lưu dưới dạng string
  const intervalRef = useRef(null);

  // Convert tempoInput -> number an toàn (dùng useMemo để tránh parse mỗi lần render)
  const localTempo = useMemo(() => {
    const n = parseInt(tempoInput, 10);
    return isNaN(n) ? 90 : Math.max(40, Math.min(n, 240)); // clamp 40-240
  }, [tempoInput]);

  // Parse lyrics
  const parts = useMemo(() => {
    let result = [];
    let idx = 0;
    lyrics.split("\n").forEach((line) => {
      const chunks = line.split(/(\[.*?\])/g);
      chunks.forEach((chunk) => {
        if (!chunk) return;
        result.push({ id: idx++, text: chunk, isChord: chunk.startsWith("[") });
      });
      result.push({ id: idx++, text: "\n", isChord: false });
    });
    return result;
  }, [lyrics]);

  function start() {
    setPlaying(true);
  }

  function stop() {
    setPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  useEffect(() => {
    if (!playing) return;

    const beatDuration = 60000 / localTempo;
    let idx = highlightIndex;

    intervalRef.current = setInterval(() => {
      idx++;
      setHighlightIndex(idx);
      if (idx >= parts.length) {
        setPlaying(false);
        clearInterval(intervalRef.current);
      }
    }, beatDuration);

    return () => clearInterval(intervalRef.current);
  }, [playing, localTempo, parts.length]);

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
      </div>

      {/* Play/Stop */}
      <button onClick={playing ? stop : start} className={styles.playBtn}>
        {playing ? <FaStop /> : <FaPlay />}{" "}
        {playing ? "Dừng" : highlightIndex > 0 ? "Tiếp tục" : "Phát"}
      </button>

      {/* Lyrics */}
      <div className={styles["song-details__lyrics"]}>
        {parts.map((p, i) =>
          p.isChord ? (
            <ChordTooltip key={p.id} chordText={p.text}>
              <span
                className={
                  i <= highlightIndex && playing
                    ? styles.highlight
                    : styles.lyricChord
                }
              >
                {p.text}
              </span>
            </ChordTooltip>
          ) : (
            <span
              key={p.id}
              className={i <= highlightIndex && playing ? styles.highlight : ""}
            >
              {p.text}
            </span>
          )
        )}
      </div>
    </div>
  );
}
