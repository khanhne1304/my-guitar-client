import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../../components/homeItem/Header/Header";
import styles from "../../ChordPracticePage/ChordPracticeDetailPage.module.css";
import VirtualGuitarNeck from "../../../../../components/VirtualGuitarNeck";
import VirtualHand from "../../../../../components/VirtualHand";
import { toneChords } from "../../../../../data/toneChords";
import { extendedGuitarChords } from "../../../../../data/allChord";

export default function ArpeggioPage() {
  const navigate = useNavigate();
  const audioCtxRef = useRef(null);
  const tickRef = useRef(null);

  const [bpm, setBpm] = useState(80);
  const [subdivision, setSubdivision] = useState(2); // 8th mặc định
  const [pattern, setPattern] = useState("CUSTOM_A"); // CUSTOM_A, CUSTOM_B, UP, DOWN, UP_DOWN, INOUT
  const [lowString, setLowString] = useState(6);
  const [highString, setHighString] = useState(1);
  const [selectedTone, setSelectedTone] = useState(Object.keys(toneChords)[0] || "C / Am");
  const [selectedChord, setSelectedChord] = useState((toneChords[Object.keys(toneChords)[0]] || [])[0] || "C");
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [seqIdx, setSeqIdx] = useState(0);

  const click = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 1000;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
    o.stop(ctx.currentTime + 0.06);
  };

  const msPerStep = useMemo(() => {
    const beatMs = 60000 / Math.max(30, Math.min(240, bpm));
    return Math.max(25, Math.round(beatMs / Math.max(1, subdivision)));
  }, [bpm, subdivision]);

  // Cập nhật chord theo tone
  useEffect(() => {
    const chords = toneChords[selectedTone] || [];
    if (!chords.includes(selectedChord)) {
      setSelectedChord(chords[0] || "C");
    }
  }, [selectedTone]);

  // Xác định dải dây theo hợp âm đã chọn
  useEffect(() => {
    const shape = extendedGuitarChords[selectedChord];
    if (!shape || !Array.isArray(shape.frets)) return;
    const used = [];
    shape.frets.forEach((f, idx) => {
      const stringNumber = 6 - idx; // idx 0 -> dây 6, idx 5 -> dây 1
      // Bỏ các dây tắt (x hoặc X), nhận cả open string (0) và số > 0
      if (f !== 'x' && f !== 'X' && f !== null && f !== undefined) {
        used.push(stringNumber);
      }
    });
    if (used.length) {
      const lo = Math.min(...used);
      const hi = Math.max(...used);
      setHighString(lo);
      setLowString(hi);
    }
  }, [selectedChord]);

  const buildSequence = useMemo(() => {
    const lo = Math.min(lowString, highString);
    const hi = Math.max(lowString, highString);
    const up = Array.from({ length: hi - lo + 1 }, (_, i) => hi - i); // 6..1 hi→lo visual top-down
    const down = [...up].reverse();
    switch (pattern) {
      case "CUSTOM_A": {
        const B = lowString; // dây bass theo hợp âm
        return [B,3,2,3,1,3,2,3];
      }
      case "CUSTOM_B": {
        const B = lowString;
        return [B,3,2,1];
      }
      case "UP":
        return up;
      case "DOWN":
        return down;
      case "INOUT": {
        // ví dụ 3 dây giữa: 3-2-1-2-3 (hoặc 4 dây)
        const mid = Math.floor((lo + hi) / 2);
        const arr = [mid, mid - 1, mid + 1, mid, mid - 1, mid + 1].filter(
          (s) => s >= lo && s <= hi
        );
        return arr.length ? arr : up;
      }
      case "UP_DOWN":
      default:
        return up.concat(down.slice(1, -1));
    }
  }, [pattern, lowString, highString]);

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    setStepIndex(0);
    setSeqIdx(0);
    tickRef.current = setInterval(() => {
      setStepIndex((p) => (p + 1) % subdivision);
      setSeqIdx((i) => (i + 1) % buildSequence.length);
      click();
    }, msPerStep);
  };

  const stop = () => {
    setIsRunning(false);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  };

  useEffect(() => () => stop(), []);

  const currentString = buildSequence[seqIdx] ?? 1;
  const stringToFinger = useMemo(() => ({ [lowString]: 5, 3: 1, 2: 2, 1: 3 }), [lowString]);
  const currentFinger = stringToFinger[currentString] ?? null;

  return (
    <>
      <Header />
      <main className={styles.detailPage}>
        <div className={styles.container}>
          <button onClick={() => navigate("/tools/finger-practice/right")} className={styles.backButton}>
            ← Quay lại
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Luyện tập rải dây</h1>
            <p className={styles.description}>Arpeggio qua nhiều dây theo pattern và nhịp.</p>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressCard}>
              <h3>Thiết lập</h3>
              <div className={styles.formGrid}>
                <label className={styles.formLabel}>
                  BPM
                  <input className={styles.field} type="number" min="30" max="240" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value || "0", 10))} />
                </label>
                <label className={styles.formLabel}>
                  Tone
                  <select className={styles.field} value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)}>
                    {Object.keys(toneChords).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className={styles.formLabel}>
                  Hợp âm
                  <select className={styles.field} value={selectedChord} onChange={(e) => setSelectedChord(e.target.value)}>
                    {(toneChords[selectedTone] || []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className={styles.formLabel}>
                  Pattern
                  <select className={styles.field} value={pattern} onChange={(e) => setPattern(e.target.value)}>
                    <option value="CUSTOM_A">B-3-2-3-1-3-2-3</option>
                    <option value="CUSTOM_B">B-3-2-1</option>
                    <option value="UP">Lên (low→high)</option>
                    <option value="DOWN">Xuống (high→low)</option>
                    <option value="UP_DOWN">Lên rồi xuống</option>
                    <option value="INOUT">Trong–ngoài (ping‑pong)</option>
                  </select>
                </label>
              </div>

              <div className={styles.controls}>
                {!isRunning ? (
                  <button className={styles.practiceBtn} onClick={start}>Bắt đầu</button>
                ) : (
                  <button className={styles.practiceBtn} onClick={stop}>Dừng</button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.section}>
              <h2>Trạng thái</h2>
              <div className={styles.hudGrid}>
                <div className={styles.hudItem}>
                  <div className={styles.hudItemTitle}>Dây hiện tại</div>
                  <div className={styles.hudItemValue}>{currentString}</div>
                </div>
                <div className={styles.hudItem}>
                  <div className={styles.hudItemTitle}>Bước</div>
                  <div className={styles.hudItemValue}>{(seqIdx % buildSequence.length) + 1}/{buildSequence.length}</div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2>Minh họa đàn ảo</h2>
              <div className={styles.hudGrid}>
                <div className={styles.hudItem}>
                  {(() => {
                    const frets = [0,0,0,0,0,0];
                    const mapping = [0,0,0,0,0,0];
                    const chordData = { frets, barre: null };
                    return (
                      <VirtualGuitarNeck
                        chordData={chordData}
                        fingerMapping={mapping}
                        chordName="Arpeggio"
                        animate={false}
                        highlightString={currentString}
                        highlightStringFingerMap={stringToFinger}
                      />
                    );
                  })()}
                </div>
                <div className={styles.hudItem}>
                  {(() => {
                    const frets = [0,0,0,0,0,0];
                    const mapping = [0,0,0,0,0,0];
                    const chordData = { frets, barre: null };
                    // Tay phải: tô màu ngón cái (5), bỏ ngón út (4). Làm nổi bật ngón đang dùng.
                    return (
                      <VirtualHand
                        fingerMapping={mapping}
                        chordData={chordData}
                        activeFingersOverride={currentFinger ? [5,1,2,3] : [5,1,2,3]}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


