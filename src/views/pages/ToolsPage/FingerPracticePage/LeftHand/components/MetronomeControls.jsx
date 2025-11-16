import styles from "./MetronomeControls.module.css";

export default function MetronomeControls({
  bpm,
  setBpm,
  initialBpm,
  autoBpmEnabled,
  setAutoBpmEnabled,
  metronomeEnabled,
  setMetronomeEnabled,
  metronomeVolume,
  setMetronomeVolume
}) {
  const handleBpmChange = (delta) => {
    setBpm(prev => Math.max(40, Math.min(240, prev + delta)));
  };
  
  return (
    <div className={styles.metronomeControls}>
      <h3 className={styles.sectionTitle}>🎚 Metronome</h3>
      
      <div className={styles.controlsGrid}>
        {/* BPM Control */}
        <div className={styles.controlGroup}>
          <label className={styles.label}>BPM</label>
          <div className={styles.bpmControl}>
            <button 
              className={styles.bpmButton}
              onClick={() => handleBpmChange(-5)}
            >
              −5
            </button>
            <button 
              className={styles.bpmButton}
              onClick={() => handleBpmChange(-1)}
            >
              −1
            </button>
            <input
              type="number"
              min="40"
              max="240"
              value={bpm}
              onChange={(e) => setBpm(Math.max(40, Math.min(240, Number(e.target.value))))}
              className={styles.bpmInput}
            />
            <button 
              className={styles.bpmButton}
              onClick={() => handleBpmChange(1)}
            >
              +1
            </button>
            <button 
              className={styles.bpmButton}
              onClick={() => handleBpmChange(5)}
            >
              +5
            </button>
          </div>
          <input
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className={styles.bpmSlider}
          />
        </div>
        
        {/* Metronome Toggle */}
        <div className={styles.controlGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={metronomeEnabled}
              onChange={(e) => setMetronomeEnabled(e.target.checked)}
              className={styles.checkbox}
            />
            <span>Bật metronome</span>
          </label>
        </div>
        
        {/* Volume Control */}
        {metronomeEnabled && (
          <div className={styles.controlGroup}>
            <label className={styles.label}>Âm lượng</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={metronomeVolume}
              onChange={(e) => setMetronomeVolume(Number(e.target.value))}
              className={styles.volumeSlider}
            />
            <span className={styles.volumeValue}>{Math.round(metronomeVolume * 100)}%</span>
          </div>
        )}
        
        {/* Auto BPM */}
        <div className={styles.controlGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={autoBpmEnabled}
              onChange={(e) => setAutoBpmEnabled(e.target.checked)}
              className={styles.checkbox}
            />
            <span>Auto BPM (tăng 5 BPM khi đạt &gt;90%)</span>
          </label>
        </div>
      </div>
    </div>
  );
}

