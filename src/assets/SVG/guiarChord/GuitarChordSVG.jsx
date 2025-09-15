import { guitarChords } from "../../../data/allChord";

export default function GuitarChordSVG({
  chord,
  width = 140,
  accentColor = "#111",
  showTitle = false,
}) {
  const shape = guitarChords[chord];
  if (!shape) {
    return <div style={{ width, textAlign: "center" }}>Chưa hỗ trợ {chord}</div>;
  }

  const padL = 25, padT = 28, stringGap = 20, fretGap = 24;
  const numStrings = 6, numFrets = 5;
  const svgWidth = width;
  const svgHeight = padT + fretGap * (numFrets + 1) + (showTitle ? 16 : 0);

  // ✅ dây 6 bên trái → dây 1 bên phải
  const xForString = (s) => padL + (numStrings - s) * stringGap;


  // 👉 Tính ngăn cao nhất được dùng để hiển thị số "fr"
  const maxFret = Math.max(
    ...(shape.frets.filter((f) => typeof f === "number" && f > 0)),
    shape.barre?.fret || 0
  );
  const baseFret = maxFret > numFrets ? Math.min(...shape.frets.filter(f => typeof f === "number" && f > 0)) : 1;

  return (
    <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
      {/* Tiêu đề hợp âm */}
      {showTitle && (
        <text x={svgWidth / 2} y={14} textAnchor="middle" fontSize="13" fontWeight="700">
          {chord}
        </text>
      )}

      {/* Dây dọc */}
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

      {/* Phím ngang */}
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

      {/* Nut (phím 0 dày hơn) */}
      {baseFret === 1 && (
        <line
          x1={padL}
          y1={padT}
          x2={padL + (numStrings - 1) * stringGap}
          y2={padT}
          stroke="#000"
          strokeWidth="3"
        />
      )}

      {/* Số ngăn bên trái */}
      {Array.from({ length: numFrets }, (_, i) => (
        <text
          key={`num${i}`}
          x={padL - 10}
          y={padT + (i + 1) * fretGap - 6}
          fontSize="10"
          textAnchor="end"
          fill="#444"
        >
          {baseFret + i}
        </text>
      ))}

      {/* Barre (nếu có) */}
      {shape.barre && (() => {
        const { fromString, toString, fret } = shape.barre;
        const xA = xForString(fromString);
        const xB = xForString(toString);

        // ✅ Phủ trọn từ dây ngoài này sang dây ngoài kia (tính theo mép, không chỉ tâm)
        const xLeft = Math.min(xA, xB) - stringGap / 2;
        const xRight = Math.max(xA, xB) + stringGap / 2;
        const w = xRight - xLeft;

        return (
          <rect
            x={xLeft}
            y={padT + (fret - baseFret + 0.5) * fretGap - 6}
            width={w}
            height={12}
            rx={6}
            fill={accentColor}
            opacity="0.9"
          />
        );
      })()}


      {/* Nốt bấm + O/X */}
      {shape.frets.map((fret, idx) => {
        // mảng frets: [E6, A5, D4, G3, B2, E1]
        // → stringNumber 6..1
        const stringNumber = numStrings - idx;
        const x = xForString(stringNumber);

        // ✅ Bỏ vẽ nốt nếu nốt nằm đúng phím barre và trong phạm vi dây barre
        const inBarre =
          shape.barre &&
          typeof fret === "number" &&
          fret === shape.barre.fret &&
          (
            (stringNumber <= shape.barre.fromString && stringNumber >= shape.barre.toString) ||
            (stringNumber >= shape.barre.fromString && stringNumber <= shape.barre.toString)
          );

        if (inBarre) return null;

        if (fret === "x") {
          return <text key={`x${idx}`} x={x} y={padT - 8} fontSize="12" textAnchor="middle">X</text>;
        }
        if (fret === 0) {
          return <text key={`o${idx}`} x={x} y={padT - 8} fontSize="12" textAnchor="middle">O</text>;
        }
        if (typeof fret === "number") {
          return (
            <circle
              key={`n${idx}`}
              cx={x}
              cy={padT + (fret - baseFret + 0.5) * fretGap}
              r={6.5}
              fill={accentColor}
            />
          );
        }
        return null;
      })}

    </svg>
  );
}
