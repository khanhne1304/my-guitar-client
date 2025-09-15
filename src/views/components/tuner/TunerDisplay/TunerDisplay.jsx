import styles from "./TunerDisplay.module.css";

export default function TunerDisplay({ 
  noteData, 
  isRunning, 
  onStart, 
  onStop,
  tunerMode,
  setTunerMode,
  selectedString,
  setSelectedString
}) {
  const strings = ["E2", "A2", "D3", "G3", "B3", "E4"];
  const IN_TUNE_TOLERANCE_CENTS = 20; // vùng chấp nhận tổng: ±20 cents

  let deviation = noteData?.cents || 0;
  let statusText = isRunning ? "Đang nghe..." : "Chưa bắt đầu";
  let statusClass = styles.statusNeutral;

  if (isRunning && noteData) {
    if (noteData.isStable) {
      const absCents = Math.abs(deviation);
      if (absCents <= IN_TUNE_TOLERANCE_CENTS) {
        statusText = "Đúng tông";
        statusClass = styles.statusGood;
      } else if (deviation > 0) {
        statusText = "Quá cao";
        statusClass = styles.statusSharp;
      } else {
        statusText = "Quá thấp";
        statusClass = styles.statusFlat;
      }
    } else {
      statusText = "Đang phát hiện...";
      statusClass = styles.statusDetecting;
    }
  }

  // Tính vị trí kim chỉ, giới hạn trong [0%, 100%]
  const rawLeft = 50 + deviation / 5; // map cents → %
  const indicatorLeft = Math.max(0, Math.min(100, rawLeft));

  return (
    <div className={styles.card}>
      {/* Toggle chế độ */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${tunerMode === "auto" ? styles.active : ""}`}
          onClick={() => setTunerMode("auto")}
        >
          Auto Detect
        </button>
        <button
          className={`${styles.modeBtn} ${tunerMode === "manual" ? styles.active : ""}`}
          onClick={() => setTunerMode("manual")}
        >
          Manual Select
        </button>
      </div>

      <h1 className={styles.note}>
        {tunerMode === "auto" 
          ? (noteData ? noteData.note : "---") 
          : selectedString
        }
      </h1>
      <p className={styles.target}>
        Target: {tunerMode === "auto" 
          ? (noteData ? `${noteData.targetFreq.toFixed(2)} Hz` : "--- Hz")
          : `${getTargetFrequency(selectedString)} Hz`
        }
      </p>
      
      {/* Hiển thị trạng thái ổn định */}
      {isRunning && noteData && noteData.isStable && (
        <div className={styles.statusInfo}>
          <p className={styles.stableIndicator}>✓ Stable</p>
        </div>
      )}

      {/* Thanh hiển thị độ lệch + vùng chấp nhận */}
      <div className={styles.barWrapper}>
        <div className={styles.bar}>
          {/* Mapping: 1% = 5 cents. Total tolerance ±20c (46%↔54%).
              Green (perfect) ±6c: width 12c ⇒ 2.4% (48.8%↔51.2%).
              Orange (tolerance) 6–20c: each side width 14c ⇒ 2.8%. */}
          {/* Orange left: 46% → 48.8% */}
          <div className={`${styles.zone} ${styles.zoneWarn}`} style={{ left: '46%', width: '2.8%' }} />
          {/* Green center: 48.8% → 51.2% */}
          <div className={`${styles.zone} ${styles.zoneGood}`} style={{ left: '48.8%', width: '2.4%' }} />
          {/* Orange right: 51.2% → 54% */}
          <div className={`${styles.zone} ${styles.zoneWarn}`} style={{ left: '51.2%', width: '2.8%' }} />

          <div
            className={styles.indicator}
            style={{ left: `${indicatorLeft}%` }}
          ></div>
        </div>
      </div>

      {/* Trạng thái */}
      <p className={statusClass}>{statusText}</p>
      <p className={styles.toleranceNote}>
        Chấp nhận lệch ±{IN_TUNE_TOLERANCE_CENTS} cents
      </p>

      {/* Nút Start / Stop */}
      {!isRunning ? (
        <button className={styles.startBtn} onClick={onStart}>
          ▶ Start
        </button>
      ) : (
        <button className={styles.stopBtn} onClick={onStop}>
          ⏹ Stop
        </button>
      )}

      {isRunning && <p className={styles.recording}>Đang ghi âm...</p>}

      {/* Nút chọn dây - chỉ hiển thị khi ở chế độ manual */}
      {tunerMode === "manual" && (
        <div className={styles.stringSelector}>
          <p className={styles.selectorLabel}>Chọn dây đàn:</p>
          <div className={styles.stringButtons}>
            {strings.map((s) => (
              <button
                key={s}
                className={`${styles.stringBtn} ${
                  selectedString === s ? styles.active : ""
                }`}
                onClick={() => setSelectedString(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getTargetFrequency(note) {
  const FREQUENCIES = {
    E2: 82.41,
    A2: 110.0,
    D3: 146.83,
    G3: 196.0,
    B3: 246.94,
    E4: 329.63,
  };
  return FREQUENCIES[note] || "-";
}
