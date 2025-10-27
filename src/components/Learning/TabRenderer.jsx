// src/components/Learning/TabRenderer.jsx
import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { guitarChords } from '../../data/allChord';
import styles from './TabRenderer.module.css';

/**
 * TabRenderer Component
 * Render Tab/Hợp âm từ JSON data với SVG
 */
const TabRenderer = forwardRef(({
  tabData,
  highlightedTab,
  currentTime,
  onTabClick
}, ref) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getDimensions: () => dimensions,
    highlightTab: (tab) => {
      // Implementation for highlighting specific tab
    }
  }));

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render guitar tab
  const renderGuitarTab = () => {
    if (!tabData || !tabData.tabs) return null;

    const { width, height } = dimensions;
    const stringSpacing = 30;
    const fretSpacing = 40;
    const startX = 20;
    const startY = 50;
    const strings = ['E', 'A', 'D', 'G', 'B', 'E'];
    const frets = 12;

    return (
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className={styles.tabRenderer__svg}
      >
          {/* Strings */}
        {strings.map((string, index) => (
            <line
            key={`string-${index}`}
              x1={startX}
            y1={startY + index * stringSpacing}
            x2={startX + frets * fretSpacing}
            y2={startY + index * stringSpacing}
              stroke="#333"
              strokeWidth="2"
            />
          ))}

          {/* Frets */}
        {Array.from({ length: frets + 1 }, (_, index) => (
            <line
            key={`fret-${index}`}
            x1={startX + index * fretSpacing}
              y1={startY}
            x2={startX + index * fretSpacing}
            y2={startY + (strings.length - 1) * stringSpacing}
              stroke="#333"
            strokeWidth={index === 0 ? "3" : "1"}
            />
          ))}

        {/* Fret Numbers */}
        {Array.from({ length: frets }, (_, index) => (
          <text
            key={`fret-number-${index}`}
            x={startX + index * fretSpacing + fretSpacing / 2}
            y={startY - 10}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            {index + 1}
          </text>
        ))}

        {/* String Names */}
        {strings.map((string, index) => (
          <text
            key={`string-name-${index}`}
            x={startX - 10}
            y={startY + index * stringSpacing + 5}
            textAnchor="end"
            fontSize="14"
            fontWeight="bold"
            fill="#333"
          >
            {string}
          </text>
        ))}

        {/* Tab Notes */}
        {tabData.tabs.map((tab, tabIndex) => (
          <g key={`tab-${tabIndex}`}>
            {tab.notes?.map((note, noteIndex) => (
              <g key={`note-${tabIndex}-${noteIndex}`}>
                {/* Note Circle */}
                <circle
                  cx={startX + (note.fret - 1) * fretSpacing + fretSpacing / 2}
                  cy={startY + note.string * stringSpacing}
                  r="8"
                  fill={highlightedTab === tab ? "#667eea" : "#333"}
                  stroke={highlightedTab === tab ? "#5a67d8" : "#666"}
                  strokeWidth="2"
                  className={styles.tabRenderer__note}
                  onClick={() => onTabClick?.(tab)}
                />
                {/* Fret Number */}
                <text
                  x={startX + (note.fret - 1) * fretSpacing + fretSpacing / 2}
                  y={startY + note.string * stringSpacing + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {note.fret}
                </text>
              </g>
            ))}
          </g>
        ))}
      </svg>
    );
  };

  // Render chord diagram
  const renderChordDiagram = () => {
    if (!tabData || !tabData.chord) return null;

    const chord = guitarChords[tabData.chord];
    if (!chord) return null;

    const { width, height } = dimensions;
    const stringSpacing = 30;
    const fretSpacing = 40;
    const startX = 20;
    const startY = 50;
    const strings = ['E', 'A', 'D', 'G', 'B', 'E'];

              return (
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className={styles.tabRenderer__svg}
      >
        {/* Chord Name */}
        <text
          x={width / 2}
          y={30}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#333"
        >
          {tabData.chord}
        </text>

        {/* Strings */}
        {strings.map((string, index) => (
          <line
            key={`string-${index}`}
            x1={startX}
            y1={startY + index * stringSpacing}
            x2={startX + 4 * fretSpacing}
            y2={startY + index * stringSpacing}
                  stroke="#333"
                  strokeWidth="2"
                />
        ))}

        {/* Frets */}
        {Array.from({ length: 5 }, (_, index) => (
          <line
            key={`fret-${index}`}
            x1={startX + index * fretSpacing}
            y1={startY}
            x2={startX + index * fretSpacing}
            y2={startY + (strings.length - 1) * stringSpacing}
            stroke="#333"
            strokeWidth={index === 0 ? "3" : "1"}
          />
        ))}

        {/* Fret Numbers */}
        {Array.from({ length: 4 }, (_, index) => (
          <text
            key={`fret-number-${index}`}
            x={startX + index * fretSpacing + fretSpacing / 2}
            y={startY - 10}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            {index + 1}
          </text>
        ))}

        {/* String Names */}
        {strings.map((string, index) => (
          <text
            key={`string-name-${index}`}
            x={startX - 10}
            y={startY + index * stringSpacing + 5}
            textAnchor="end"
            fontSize="14"
            fontWeight="bold"
            fill="#333"
          >
            {string}
          </text>
        ))}

        {/* Chord Fingers */}
        {chord.frets.map((fret, stringIndex) => {
          if (fret === 'x' || fret === 0) return null;
          
              return (
            <g key={`finger-${stringIndex}`}>
              {/* Finger Circle */}
                  <circle
                cx={startX + (fret - 1) * fretSpacing + fretSpacing / 2}
                    cy={startY + stringIndex * stringSpacing}
                    r="8"
                fill="#667eea"
                stroke="#5a67d8"
                    strokeWidth="2"
                  />
              {/* Finger Number */}
                    <text
                x={startX + (fret - 1) * fretSpacing + fretSpacing / 2}
                      y={startY + stringIndex * stringSpacing + 4}
                textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      fontWeight="bold"
                    >
                {fret}
                    </text>
            </g>
          );
        })}

        {/* Barre */}
        {chord.barre && (
          <rect
            x={startX + (chord.barre.fret - 1) * fretSpacing + 5}
            y={startY + (strings.length - chord.barre.toString) * stringSpacing - 3}
            width={fretSpacing - 10}
            height={6}
            fill="#667eea"
            stroke="#5a67d8"
            strokeWidth="1"
            rx="3"
          />
        )}

        {/* Muted Strings */}
        {chord.frets.map((fret, stringIndex) => {
          if (fret === 'x') {
            return (
              <text
                key={`muted-${stringIndex}`}
                x={startX - 5}
                y={startY + stringIndex * stringSpacing + 5}
                textAnchor="middle"
                fontSize="12"
                fill="#ef4444"
                fontWeight="bold"
              >
                ×
              </text>
            );
          }
          return null;
          })}
        </svg>
    );
  };

  // Render rhythm pattern
  const renderRhythmPattern = () => {
    if (!tabData || !tabData.rhythm) return null;

    const { width, height } = dimensions;
    const beatWidth = width / tabData.rhythm.beats;
    const startY = height / 2;
    
    return (
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className={styles.tabRenderer__svg}
      >
        {/* Rhythm Title */}
        <text
          x={width / 2}
          y={30}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#333"
        >
          {tabData.rhythm.name || 'Rhythm Pattern'}
        </text>

        {/* Beat Lines */}
        {Array.from({ length: tabData.rhythm.beats + 1 }, (_, index) => (
          <line
            key={`beat-line-${index}`}
            x1={index * beatWidth}
            y1={startY - 50}
            x2={index * beatWidth}
            y2={startY + 50}
            stroke="#ddd"
            strokeWidth="1"
          />
        ))}

        {/* Beat Numbers */}
        {Array.from({ length: tabData.rhythm.beats }, (_, index) => (
          <text
            key={`beat-number-${index}`}
            x={index * beatWidth + beatWidth / 2}
            y={startY - 60}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#333"
          >
            {index + 1}
          </text>
        ))}

        {/* Rhythm Notes */}
        {tabData.rhythm.pattern?.map((note, index) => (
          <g key={`rhythm-note-${index}`}>
            {/* Note Circle */}
            <circle
              cx={index * beatWidth + beatWidth / 2}
              cy={startY}
              r="12"
              fill={highlightedTab?.beat === index ? "#667eea" : "#333"}
              stroke={highlightedTab?.beat === index ? "#5a67d8" : "#666"}
              strokeWidth="2"
            />
            {/* Note Value */}
            <text
              x={index * beatWidth + beatWidth / 2}
              y={startY + 4}
              textAnchor="middle"
              fontSize="10"
              fill="white"
              fontWeight="bold"
            >
              {note.value || '1'}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // Determine content type and render
  const renderContent = () => {
    if (!tabData) {
      return (
        <div className={styles.tabRenderer__empty}>
          <svg className={styles.tabRenderer__emptyIcon} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
          </svg>
          <p className={styles.tabRenderer__emptyText}>Chưa có Tab/Chord</p>
        </div>
      );
    }

    switch (tabData.contentType) {
      case 'chord':
        return renderChordDiagram();
      case 'rhythm':
        return renderRhythmPattern();
      case 'tab':
      default:
        return renderGuitarTab();
    }
  };

  return (
    <div className={styles.tabRenderer}>
      <div className={styles.tabRenderer__header}>
        <h3 className={styles.tabRenderer__title}>
          {tabData?.contentType === 'chord' ? 'Hợp âm' : 
           tabData?.contentType === 'rhythm' ? 'Nhịp điệu' : 'Tab Guitar'}
        </h3>
        {tabData?.chord && (
          <span className={styles.tabRenderer__chordName}>
            {tabData.chord}
          </span>
        )}
      </div>
      
      <div className={styles.tabRenderer__content}>
        {renderContent()}
      </div>
    </div>
  );
});

TabRenderer.displayName = 'TabRenderer';

export default TabRenderer;