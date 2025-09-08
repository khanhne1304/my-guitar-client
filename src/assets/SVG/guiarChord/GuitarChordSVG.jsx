import { guitarChords } from "../../../data/allChord";

export default function GuitarChordSVG({
  chord,
  width = 120,
  accentColor = "#111",
  showTitle = false,
}) {
  const shape = guitarChords[chord];
  if (!shape) {
    return <div style={{ width, textAlign: "center" }}>Chưa hỗ trợ {chord}</div>;
  }

  const padL = 15, padT = 24, stringGap = 18, fretGap = 22;
  const numStrings = 6, numFrets = 5;
  const svgWidth = width;
  const svgHeight = padT + fretGap * (numFrets + 1) + (showTitle ? 16 : 0);

  const xForString = (s) => padL + (numStrings - s) * stringGap;


  return (
    <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
      {/* Tiêu đề */}
      {showTitle && (
        <text x={svgWidth / 2} y={14} textAnchor="middle" fontSize="12" fontWeight="700">
          {chord}
        </text>
      )}

      {/* 6 dây */}
      {Array.from({ length: numStrings }, (_, i) => (
        <line
          key={`s${i}`}
          x1={padL + i * stringGap}
          y1={padT}
          x2={padL + i * stringGap}
          y2={padT + numFrets * fretGap}
          stroke="#000"
        />
      ))}

      {/* 5 phím */}
      {Array.from({ length: numFrets }, (_, i) => (
        <line
          key={`f${i}`}
          x1={padL}
          y1={padT + (i + 1) * fretGap}
          x2={padL + (numStrings - 1) * stringGap}
          y2={padT + (i + 1) * fretGap}
          stroke="#000"
        />
      ))}

      {/* Nut (phím 0) */}
      <line
        x1={padL}
        y1={padT}
        x2={padL + (numStrings - 1) * stringGap}
        y2={padT}
        stroke="#000"
        strokeWidth="3"
      />

      {/* Barre (nếu có) */}
      {shape.barre && (() => {
        const sFrom = Math.min(shape.barre.fromString, shape.barre.toString);
        const sTo = Math.max(shape.barre.fromString, shape.barre.toString);
        return (
          <rect
            x={xForString(sFrom)}
            y={padT + (shape.barre.fret - 0.5) * fretGap - 6}
            width={(sTo - sFrom) * stringGap}
            height={12}
            rx={6}
            fill={accentColor}
            opacity="0.9"
          />
        );
      })()}

      {/* Nốt */}
      {shape.frets.map((fret, idx) => {
        const stringNumber = idx + 1; // idx=0 → dây 1, idx=5 → dây 6
        const x = xForString(stringNumber);

        if (fret === "x") {
          return <text key={`x${idx}`} x={x} y={padT - 8} fontSize="12" textAnchor="middle">X</text>;
        }
        if (fret === 0) {
          return <text key={`o${idx}`} x={x} y={padT - 8} fontSize="12" textAnchor="middle">O</text>;
        }
        return <circle key={`n${idx}`} cx={x} cy={padT + (fret - 0.5) * fretGap} r={6.5} fill={accentColor} />;
      })}
    </svg>
  );
}
