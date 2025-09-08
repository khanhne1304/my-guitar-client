import { pianoChords } from "../../../data/allChord";

export default function PianoChordSVG({
  chord,
  width = 220,
  highlight = "#F59E0B",
  showTitle = false,
}) {
  const notes = pianoChords[chord];
  if (!notes) {
    return <div style={{ width, textAlign: "center" }}>Chưa hỗ trợ {chord}</div>;
  }

  const whites = ["C", "D", "E", "F", "G", "A", "B"];
  const whiteW = width / whites.length;
  const whiteH = 90;
  const blackW = whiteW * 0.6;
  const blackH = 58;
  const svgHeight = whiteH + (showTitle ? 18 : 0);

  const blackX = {
    "C#": whiteW * 1 - blackW / 2,
    "D#": whiteW * 2 - blackW / 2,
    "F#": whiteW * 4 - blackW / 2,
    "G#": whiteW * 5 - blackW / 2,
    "A#": whiteW * 6 - blackW / 2,
  };

  return (
    <svg width={width} height={svgHeight} viewBox={`0 0 ${width} ${svgHeight}`}>
      {showTitle && (
        <text x={width / 2} y={14} textAnchor="middle" fontSize="12" fontWeight="700">
          {chord}
        </text>
      )}

      {/* Phím trắng */}
      {whites.map((n, i) => (
        <rect
          key={n}
          x={i * whiteW}
          y={showTitle ? 18 : 0}
          width={whiteW}
          height={whiteH}
          fill={notes.includes(n) ? highlight : "#fff"}
          stroke="#000"
        />
      ))}

      {/* Phím đen */}
      {["C#", "D#", "F#", "G#", "A#"].map((n) => {
        const x = blackX[n];
        if (x === undefined) return null;
        const active = notes.includes(n);
        return (
          <rect
            key={n}
            x={x}
            y={showTitle ? 18 : 0}
            width={blackW}
            height={blackH}
            fill={active ? highlight : "#000"}
            stroke={active ? "#000" : "none"}
          />
        );
      })}
    </svg>
  );
}
