import { useMemo, useState } from 'react';
import {
  getHopamVoicings,
  getHopamBaseFret,
} from '../../utils/hopamChordParser';
import styles from './GuitarChordSVG.module.css';

const NUM_STRINGS = 6;
const NUM_FRETS = 4;
const PAD_L = 18;
const PAD_R = 34;
const PAD_T = 22;
const STRING_GAP = 22;
const FRET_GAP = 26;

function xForString(stringNumber) {
  return PAD_L + (NUM_STRINGS - stringNumber) * STRING_GAP;
}

export default function GuitarChordSVG({
  chord,
  width = 140,
  accentColor = '#111',
  showTitle = false,
  chordsDataMap = null,
  transpose = 0,
  showVoicingNav = false,
  voicingIndex: controlledIndex,
  onVoicingChange,
}) {
  const voicings = useMemo(
    () => getHopamVoicings(chord, chordsDataMap, transpose),
    [chord, chordsDataMap, transpose],
  );

  const [internalIndex, setInternalIndex] = useState(0);
  const voicingIndex = controlledIndex ?? internalIndex;
  const voicing = voicings[voicingIndex] || null;

  const contentWidth = (NUM_STRINGS - 1) * STRING_GAP;
  const svgWidth = Math.max(width, PAD_L + contentWidth + PAD_R);
  const svgHeight = PAD_T + FRET_GAP * (NUM_FRETS + 1) + (showTitle ? 20 : 0);

  function setVoicingIndex(next) {
    if (!voicings.length) return;
    const wrapped = ((next % voicings.length) + voicings.length) % voicings.length;
    if (onVoicingChange) onVoicingChange(wrapped);
    else setInternalIndex(wrapped);
  }

  if (!voicing) {
    return (
      <div style={{ width, textAlign: 'center', fontSize: 12, color: '#666' }}>
        Chưa hỗ trợ {chord}
      </div>
    );
  }

  const baseFret = getHopamBaseFret(voicing.scheme);

  return (
    <div className={styles.wrap}>
      <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {showTitle && (
          <text x={svgWidth / 2} y={14} textAnchor="middle" fontSize="13" fontWeight="700">
            {chord}
          </text>
        )}

        {Array.from({ length: NUM_STRINGS }, (_, i) => (
          <line
            key={`s${i}`}
            x1={PAD_L + i * STRING_GAP}
            y1={PAD_T}
            x2={PAD_L + i * STRING_GAP}
            y2={PAD_T + NUM_FRETS * FRET_GAP}
            stroke="#000"
            strokeWidth="1"
          />
        ))}

        {Array.from({ length: NUM_FRETS }, (_, i) => (
          <line
            key={`f${i}`}
            x1={PAD_L}
            y1={PAD_T + (i + 1) * FRET_GAP}
            x2={PAD_L + (NUM_STRINGS - 1) * STRING_GAP}
            y2={PAD_T + (i + 1) * FRET_GAP}
            stroke="#000"
            strokeWidth="1"
          />
        ))}

        {baseFret === 1 && (
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L + (NUM_STRINGS - 1) * STRING_GAP}
            y2={PAD_T}
            stroke="#000"
            strokeWidth="3"
          />
        )}

        {Array.from({ length: NUM_FRETS }, (_, i) => (
          <text
            key={`fr${i}`}
            x={PAD_L + contentWidth + 8}
            y={PAD_T + (i + 1) * FRET_GAP - 6}
            fontSize="10"
            fill="#333"
          >
            {baseFret + i}fr
          </text>
        ))}

        {voicing.scheme.map((fret, idx) => {
          const stringNumber = NUM_STRINGS - idx;
          const x = xForString(stringNumber);

          if (fret === 'x') {
            return (
              <text key={`x${idx}`} x={x} y={PAD_T - 6} fontSize="12" textAnchor="middle" fill="#000">
                X
              </text>
            );
          }

          if (fret === 0) {
            return (
              <text key={`o${idx}`} x={x} y={PAD_T - 6} fontSize="12" textAnchor="middle" fill="#000">
                o
              </text>
            );
          }

          if (typeof fret === 'number') {
            const displayFret = fret - baseFret + 1;
            if (displayFret < 1 || displayFret > NUM_FRETS) return null;

            const y = PAD_T + (displayFret - 0.5) * FRET_GAP;
            const finger = voicing.fingers[idx];

            return (
              <g key={`n${idx}`}>
                <circle cx={x} cy={y} r={9} fill={accentColor} stroke={accentColor} strokeWidth="1" />
                {finger && finger !== 'x' && finger !== '0' && (
                  <text
                    x={x}
                    y={y + 4}
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                    fill="#fff"
                  >
                    {finger}
                  </text>
                )}
              </g>
            );
          }

          return null;
        })}
      </svg>

      {showVoicingNav && voicings.length > 1 && (
        <div className={styles.voicingNav}>
          <button
            type="button"
            className={styles.voicingBtn}
            onClick={() => setVoicingIndex(voicingIndex - 1)}
            aria-label="Thế tay trước"
          >
            ‹
          </button>
          <span className={styles.voicingLabel}>
            Thế tay {voicingIndex + 1}/{voicings.length}
          </span>
          <button
            type="button"
            className={styles.voicingBtn}
            onClick={() => setVoicingIndex(voicingIndex + 1)}
            aria-label="Thế tay sau"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
