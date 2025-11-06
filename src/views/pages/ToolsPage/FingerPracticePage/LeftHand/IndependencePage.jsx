import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../../components/homeItem/Header/Header";
import styles from "../../ChordPracticePage/ChordPracticeDetailPage.module.css";
import VirtualGuitarNeck from "../../../../../components/VirtualGuitarNeck";
import VirtualHand from "../../../../../components/VirtualHand";

// Mẫu cố định 1-2-3-4
const FIXED_PATTERN = [1, 2, 3, 4];

export default function IndependencePage() {
  const navigate = useNavigate();
  const audioCtxRef = useRef(null);
  const tickTimerRef = useRef(null);
  const boundaryHandledRef = useRef(false);

  const [bpm, setBpm] = useState(80);
  const [subdivision, setSubdivision] = useState(4); // 16th = 4 nốt mỗi phách
  const [repeatsPerPattern, setRepeatsPerPattern] = useState(2);
  const [playClick, setPlayClick] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [baseFret, setBaseFret] = useState(1); // vị trí bắt đầu trên cần đàn (bắt đầu từ ngăn 1)
  const [currentString, setCurrentString] = useState(1); // 1..6 (dây 1 là mảnh)

  const currentPattern = FIXED_PATTERN;

  const beatIntervalMs = useMemo(() => {
    const beatMs = 60000 / Math.max(30, Math.min(240, bpm));
    return Math.max(30, Math.round(beatMs / Math.max(1, subdivision)));
  }, [bpm, subdivision]);

  const click = () => {
    if (!playClick) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = stepIndex % 4 === 0 ? 1200 : 900;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
    o.stop(ctx.currentTime + 0.07);
  };

  const stop = () => {
    setIsRunning(false);
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    setStepIndex(0);
  };

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    // Reset trạng thái về bắt đầu: ngón 1, dây 1, ngăn baseFret (mặc định 1)
    setCurrentString(1);
    setCurrentDigit(0);
    setStepIndex(0);
    boundaryHandledRef.current = false;
    // Count-in 1 bar
    let countIn = subdivision * 1;
    let localStep = -countIn; // âm để count-in
    tickTimerRef.current = setInterval(() => {
      if (localStep >= 0) {
        setStepIndex((prev) => {
          const next = (prev + 1) % (subdivision);
          return next;
        });
        // Khi hoàn thành 1 phách 4 bước => chuyển chữ số kế tiếp trong mẫu
      }
      click();
      localStep++;
    }, beatIntervalMs);
  };

  // Cuối mỗi phách, tăng chữ số; nếu quay về 1 (nextDigit=0) thì chuyển dây ngay lập tức.
  // Dùng boundaryHandledRef để tránh double-run ở StrictMode.
  useEffect(() => {
    if (!isRunning) return;
    if (stepIndex !== subdivision - 1) {
      boundaryHandledRef.current = false;
      return;
    }
    if (boundaryHandledRef.current) return;
    boundaryHandledRef.current = true;
    setCurrentDigit((prev) => {
      const next = (prev + 1) % 4;
      if (next === 0) {
        setCurrentString((s) => {
          if (s < 6) return s + 1;
          setBaseFret((f) => Math.min(12, f + 1));
          return 1;
        });
      }
      return next;
    });
  }, [stepIndex, subdivision, isRunning]);

  // Theo dõi chữ số hiện tại trong mẫu 1-2-3-4
  const [currentDigit, setCurrentDigit] = useState(0);

  // (Tùy chọn) Lặp mẫu N lần trên mỗi dây trước khi chuyển dây
  const [repeatsDone, setRepeatsDone] = useState(0);
  useEffect(() => {
    if (!isRunning) return;
    if (stepIndex === 0 && currentDigit === 0) {
      setRepeatsDone((r) => (r + 1) % Math.max(1, repeatsPerPattern));
    }
  }, [stepIndex, currentDigit, isRunning, repeatsPerPattern]);

  useEffect(() => () => stop(), []);

  return (
    <>
      <Header />
      <main className={styles.detailPage}>
        <div className={styles.container}>
          <button onClick={() => navigate("/tools/finger-practice/left")} className={styles.backButton}>
            ← Quay lại
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Luyện tập chạy ngón</h1>
            <p className={styles.description}>Luyện tập chạy ngón.</p>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressCard}>
              <h3>Tiến độ hiện tại</h3>
              <div className={`${styles.progressStats} ${styles.progressStats5}`}>
                <div className={`${styles.statItem} ${styles.statItemCompact}`}>
                  <span className={`${styles.statNumber} ${styles.statNumberCompact}`}>{bpm}</span>
                  <span className={`${styles.statLabel} ${styles.statLabelCompact}`}>BPM</span>
                </div>
                <div className={`${styles.statItem} ${styles.statItemCompact}`}>
                  <span className={`${styles.statNumber} ${styles.statNumberCompact}`}>{subdivision}</span>
                  <span className={`${styles.statLabel} ${styles.statLabelCompact}`}>Subdivision</span>
                </div>
                <div className={`${styles.statItem} ${styles.statItemCompact}`}>
                  <span className={`${styles.statNumber} ${styles.statNumberCompact}`}>{currentString}</span>
                  <span className={`${styles.statLabel} ${styles.statLabelCompact}`}>Dây hiện tại</span>
                </div>
                <div className={`${styles.statItem} ${styles.statItemCompact}`}>
                  <span className={`${styles.statNumber} ${styles.statNumberCompact}`}>{baseFret}</span>
                  <span className={`${styles.statLabel} ${styles.statLabelCompact}`}>Fret nền</span>
                </div>
                <div className={`${styles.statItem} ${styles.statItemCompact}`}>
                  <span className={`${styles.statNumber} ${styles.statNumberCompact}`}>{currentPattern[currentDigit]}</span>
                  <span className={`${styles.statLabel} ${styles.statLabelCompact}`}>Ngón hiện tại</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.section}>
              <h2>Cài đặt</h2>
              <div className={styles.formGrid}>
                <label className={styles.formLabel}>
                  BPM
                  <input
                    className={styles.field}
                    type="number"
                    min="30"
                    max="240"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value || "0", 10))}
                  />
                </label>
                <label className={styles.formLabel}>
                  Vị trí bắt đầu (fret)
                  <input
                    className={styles.field}
                    type="number"
                    min="1"
                    max="12"
                    value={baseFret}
                    onChange={(e) => setBaseFret(parseInt(e.target.value || "1", 10))}
                  />
                </label>
                <label className={styles.formLabel}>
                  Subdivision
                  <select className={styles.field} value={subdivision} onChange={(e) => setSubdivision(parseInt(e.target.value, 10))}>
                    <option value={4}>16th (4 nốt/phách)</option>
                    <option value={2}>8th (2 nốt/phách)</option>
                  </select>
                </label>
                <label className={styles.formLabel}>
                  Lặp mỗi mẫu
                  <input
                    className={styles.field}
                    type="number"
                    min="1"
                    max="16"
                    value={repeatsPerPattern}
                    onChange={(e) => setRepeatsPerPattern(parseInt(e.target.value || "1", 10))}
                  />
                </label>
                <label className={styles.formLabel}>
                  Âm click
                  <select className={styles.field} value={playClick ? "on" : "off"} onChange={(e) => setPlayClick(e.target.value === "on")}>
                    <option value="on">Bật</option>
                    <option value="off">Tắt</option>
                  </select>
                </label>
              </div>

              <div className={styles.controls}>
                {!isRunning ? (
                  <button className={styles.practiceBtn} onClick={start}>Bắt đầu</button>
                ) : (
                  <button className={styles.practiceBtn} onClick={stop}>Dừng</button>
                )}
                <span className={styles.hintText}>Phím tắt: Space để Start/Stop</span>
              </div>

              <div className={styles.hudGrid}>
                 <div className={styles.hudItem}>
                  <div className={styles.hudItemTitle}>Mẫu hiện tại</div>
                   <div className={styles.hudItemValue}>{currentPattern.join("-")}</div>
                </div>
                <div className={styles.hudItem}>
                  <div className={styles.hudItemTitle}>Chữ số</div>
                   <div className={styles.hudItemValue}>{currentPattern[currentDigit]}</div>
                </div>
              </div>
            </div>

            {/* Danh sách mẫu đã được ẩn theo yêu cầu */}

            {/* Hình ảnh trực quan: tô màu ngón tay và ngăn phím theo chữ số hiện tại */}
            <div className={styles.section}>
              <h2>Hình ảnh trực quan</h2>
              <div className={styles.hudGrid}>
                 <div className={styles.hudItem}>
                  {(() => {
                    const activeFinger = currentPattern[currentDigit];
                     const frets = [0,0,0,0,0,0]; // [6..1]
                    const mapping = [0,0,0,0,0,0];
                     // hiển thị trên dây hiện tại
                     const arrayIndex = 6 - currentString; // chuyển dây 1..6 sang index 5..0
                     frets[arrayIndex] = baseFret + activeFinger - 1;
                     mapping[arrayIndex] = activeFinger;
                    const chordData = { frets, barre: null };
                    return <VirtualGuitarNeck chordData={chordData} fingerMapping={mapping} chordName="Independence" />;
                  })()}
                </div>
                 <div className={styles.hudItem}>
                  {(() => {
                    const activeFinger = currentPattern[currentDigit];
                    const frets = [0,0,0,0,0,0];
                    const mapping = [0,0,0,0,0,0];
                     const arrayIndex = 6 - currentString;
                     frets[arrayIndex] = baseFret + activeFinger - 1;
                     mapping[arrayIndex] = activeFinger;
                    const chordData = { frets, barre: null };
                    return <VirtualHand fingerMapping={mapping} chordData={chordData} />;
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



