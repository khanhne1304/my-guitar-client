import styles from "./TabDisplay.module.css";

export default function TabDisplay({ tab, selectedChunk, isRunning }) {
  if (!tab || !tab.notes) {
    return <div className={styles.noTab}>Không có tab cho bài này</div>;
  }
  
  const strings = tab.strings || [5, 4, 3, 2, 1, 0];
  const notes = tab.notes || [];
  
  // Find the range of frets to display
  const allFrets = notes.map(n => n.fret).filter(f => f !== undefined);
  const minFret = Math.min(...allFrets, 0);
  const maxFret = Math.max(...allFrets, 12);
  const fretRange = maxFret - minFret + 1;
  
  // Group notes by time
  const notesByTime = {};
  notes.forEach((note, idx) => {
    if (!notesByTime[note.time]) {
      notesByTime[note.time] = [];
    }
    notesByTime[note.time].push({ ...note, index: idx });
  });
  
  const isNoteInChunk = (noteIndex) => {
    if (!selectedChunk) return true;
    return noteIndex >= selectedChunk.start && noteIndex <= selectedChunk.end;
  };
  
  return (
    <div className={styles.tabDisplay}>
      <div className={styles.tabContainer}>
        {/* String labels */}
        <div className={styles.stringLabels}>
          {strings.map((stringNum, idx) => (
            <div key={idx} className={styles.stringLabel}>
              {stringNum + 1}
            </div>
          ))}
        </div>
        
        {/* Tab lines */}
        <div className={styles.tabContent}>
          {strings.map((stringNum, stringIdx) => (
            <div key={stringIdx} className={styles.stringLine}>
              {/* Fret numbers */}
              <div className={styles.fretNumbers}>
                {Array.from({ length: fretRange }, (_, i) => {
                  const fret = minFret + i;
                  return (
                    <div key={fret} className={styles.fretNumber}>
                      {fret}
                    </div>
                  );
                })}
              </div>
              
              {/* Notes on this string */}
              <div className={styles.stringNotes}>
                {Array.from({ length: fretRange }, (_, i) => {
                  const fret = minFret + i;
                  const noteOnFret = notes.find(
                    (n, idx) => 
                      n.string === stringNum && 
                      n.fret === fret &&
                      isNoteInChunk(idx)
                  );
                  
                  return (
                    <div key={fret} className={styles.fretCell}>
                      {noteOnFret && (
                        <div className={styles.note}>
                          <span className={styles.fretNumber}>{fret}</span>
                          {noteOnFret.technique && (
                            <span className={styles.technique}>
                              {noteOnFret.technique === "h" ? "H" : noteOnFret.technique === "p" ? "P" : ""}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className={styles.legend}>
        <span>H = Hammer-on</span>
        <span>P = Pull-off</span>
      </div>
    </div>
  );
}

