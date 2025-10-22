import { extendedGuitarChords } from "../../../data/allChord";
import { createFingerMapping } from "../../../utils/fingerMapping";

export default function GuitarChordSVG({
  chord,
  width = 140,
  accentColor = "#111",
  showTitle = false,
}) {
  // Hỗ trợ slash chord: A/C# → tra cứu A, vẫn hiển thị tên đầy đủ
  const baseChord = (chord || "").split("/")[0];
  const shape = extendedGuitarChords[baseChord] || extendedGuitarChords[chord];
  if (!shape) {
    return <div style={{ width, textAlign: "center" }}>Chưa hỗ trợ {chord}</div>;
  }

  // Tăng padding phải để không bị cắt phần vòng tròn/số ở dây 1
  const padL = 30, padR = 20, padT = 30, stringGap = 22, fretGap = 26;
  const numStrings = 6, numFrets = 5;
  const contentWidth = (numStrings - 1) * stringGap;
  const svgWidth = Math.max(width, padL + contentWidth + padR);
  const svgHeight = padT + fretGap * (numFrets + 1) + (showTitle ? 20 : 0);

  // ✅ dây 6 bên trái → dây 1 bên phải
  const xForString = (s) => padL + (numStrings - s) * stringGap;

  // Tạo mapping ngón tay
  const fingerMapping = createFingerMapping(shape, chord);

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


      {/* Nốt bấm + O/X + Số ngón tay */}
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

        if (fret === "x") {
          return <text key={`x${idx}`} x={x} y={padT - 8} fontSize="12" textAnchor="middle">X</text>;
        }
        if (fret === 0) {
          return <text key={`o${idx}`} x={x} y={padT - 8} fontSize="12" textAnchor="middle">O</text>;
        }
        if (typeof fret === "number") {
          const fingerNumber = fingerMapping[idx];
          const y = padT + (fret - baseFret + 0.5) * fretGap;
          
          // Kiểm tra xem nốt này có nằm trong barre không
          const inBarre =
            shape.barre &&
            fret === shape.barre.fret &&
            (
              (stringNumber <= shape.barre.fromString && stringNumber >= shape.barre.toString) ||
              (stringNumber >= shape.barre.fromString && stringNumber <= shape.barre.toString)
            );
          
          // Nếu nằm trong barre, không hiển thị số ngón tay
          if (inBarre) {
            return null; // Barre đã được vẽ ở phần trên, không cần vẽ thêm gì
          }
          
          return (
            <g key={`n${idx}`}>
              {/* Vòng tròn nền */}
              <circle
                cx={x}
                cy={y}
                r={8}
                fill="white"
                stroke={accentColor}
                strokeWidth="2"
              />
              {/* Số ngón tay */}
              <text
                x={x}
                y={y + 3}
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                fill={accentColor}
              >
                {fingerNumber}
              </text>
            </g>
          );
        }
        return null;
      })}

    </svg>
  );
}
