import { useState, useEffect, useRef, useMemo } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import ChordTooltip from "./ChordTooltip";
import styles from "../../../pages/songDetails/SongDetails.module.css";

export default function LyricsViewer({ lyrics, tempo }) {
  const [playing, setPlaying] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0); // luôn bắt đầu từ 0 (show lyric full)
  const intervalRef = useRef(null);

  // ✅ Dùng useMemo để luôn parse lyrics trước khi render
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

  // ✅ Start không reset highlightIndex -> tiếp tục từ chỗ đang dừng
  function start() {
    setPlaying(true);
  }

  // ✅ Stop không reset highlightIndex -> giữ nguyên vị trí
  function stop() {
    setPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  // ✅ Khi playing thay đổi -> chạy interval từ current index
  useEffect(() => {
    if (!playing) return;

    const beatDuration = 60000 / (tempo || 90);
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
  }, [playing, tempo, parts.length]);

  return (
    <div className={styles["song-details__lyricsWrapper"]}>
      {/* Nút Play/Stop */}
      <button onClick={playing ? stop : start} className={styles.playBtn}>
        {playing ? <FaStop /> : <FaPlay />} {playing ? "Dừng" : highlightIndex > 0 ? "Tiếp tục" : "Phát"}
      </button>

      {/* Luôn hiển thị lyrics ngay từ đầu */}
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
