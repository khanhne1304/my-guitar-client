// Model chứa dữ liệu nốt nhạc chuẩn và hàm xử lý liên quan
export const STANDARD_NOTES = [
  { name: "E2", freq: 82.41 },
  { name: "A2", freq: 110.0 },
  { name: "D3", freq: 146.83 },
  { name: "G3", freq: 196.0 },
  { name: "B3", freq: 246.94 },
  { name: "E4", freq: 329.63 },
];

export function findClosestNote(frequency) {
  if (!frequency) return null;
  let closest = STANDARD_NOTES[0];
  let minDiff = Math.abs(frequency - closest.freq);
  for (const n of STANDARD_NOTES) {
    const diff = Math.abs(frequency - n.freq);
    if (diff < minDiff) {
      closest = n;
      minDiff = diff;
    }
  }
  const cents = 1200 * Math.log2(frequency / closest.freq); // lệch cent
  return { note: closest.name, targetFreq: closest.freq, cents };
}
