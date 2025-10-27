// Hệ thống mapping ngón tay cho hợp âm guitar
// 1: ngón trỏ, 2: ngón giữa, 3: ngón áp út, 4: ngón út

/**
 * Tạo mapping ngón tay cho một hợp âm guitar
 * @param {Object} chordShape - Hình dạng hợp âm { frets: [], barre: {} }
 * @param {string} chordName - Tên hợp âm để áp dụng mapping đặc biệt
 * @returns {Array} Mảng mapping ngón tay cho từng dây
 */
export function createFingerMapping(chordShape, chordName = '') {
  const { frets, barre } = chordShape;
  const fingerMapping = new Array(6).fill(null);
  
  // Kiểm tra mapping đặc biệt cho các hợp âm chuẩn
  const specialMapping = getSpecialChordMapping(chordName, frets);
  if (specialMapping) {
    return specialMapping;
  }
  
  // Nếu có barre, ngón trỏ (1) sẽ bấm barre
  if (barre) {
    for (let i = barre.toString - 1; i <= barre.fromString - 1; i++) {
      fingerMapping[i] = 1; // Ngón trỏ bấm barre
    }
  }
  
  // Tạo danh sách các nốt cần gán ngón tay (không bao gồm barre)
  const notesToAssign = [];
  frets.forEach((fret, stringIndex) => {
    const stringNumber = 6 - stringIndex;
    
    if (fret === "x" || fret === 0 || typeof fret !== "number") {
      return;
    }
    
    // Nếu nốt này không nằm trong barre
    if (!barre || fret !== barre.fret || 
        stringNumber < barre.toString || stringNumber > barre.fromString) {
      notesToAssign.push({
        stringIndex,
        stringNumber,
        fret
      });
    }
  });
  
  // Gán ngón tay theo quy tắc chuẩn
  assignFingersToNotes(notesToAssign, fingerMapping);
  
  return fingerMapping;
}

/**
 * Lấy mapping đặc biệt cho các hợp âm chuẩn
 * @param {string} chordName - Tên hợp âm
 * @param {Array} frets - Mảng frets của hợp âm
 * @returns {Array|null} Mapping đặc biệt hoặc null
 */
function getSpecialChordMapping(chordName, frets) {
  const mapping = new Array(6).fill(null);
  
  // Hợp âm C chuẩn: [0, 3, 2, 0, 1, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'C' && JSON.stringify(frets) === JSON.stringify([0, 3, 2, 0, 1, 0])) {
    mapping[4] = 1; // Dây 2 (B), ngăn 1: ngón trỏ
    mapping[2] = 2; // Dây 4 (D), ngăn 2: ngón giữa  
    mapping[1] = 3; // Dây 5 (A), ngăn 3: ngón áp út
    return mapping;
  }
  
  // Hợp âm Am chuẩn: [0, 2, 2, 1, 0, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'Am' && JSON.stringify(frets) === JSON.stringify([0, 2, 2, 1, 0, 0])) {
    mapping[4] = 1; // Dây 2 (B), ngăn 1: ngón trỏ
    mapping[2] = 2; // Dây 4 (D), ngăn 2: ngón giữa
    mapping[3] = 3; // Dây 3 (G), ngăn 2: ngón áp út
    return mapping;
  }
  
  // Hợp âm D chuẩn: ["x", "x", 0, 2, 3, 2] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'D' && JSON.stringify(frets) === JSON.stringify(["x", "x", 0, 2, 3, 2])) {
    mapping[3] = 1; // Dây 3 (G), ngăn 2: ngón trỏ
    mapping[4] = 3; // Dây 2 (B), ngăn 3: ngón áp út
    mapping[5] = 2; // Dây 1 (E), ngăn 2: ngón giữa
    return mapping;
  }
  
  // Hợp âm Em chuẩn: [0, 2, 2, 0, 0, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'Em' && JSON.stringify(frets) === JSON.stringify([0, 2, 2, 0, 0, 0])) {
    mapping[1] = 2; // Dây 5 (A), ngăn 2: ngón trỏ
    mapping[2] = 3; // Dây 4 (D), ngăn 2: ngón giữa
    return mapping;
  }
  
  // Hợp âm G chuẩn: [3, 2, 0, 0, 0, 3] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'G' && JSON.stringify(frets) === JSON.stringify([3, 2, 0, 0, 0, 3])) {
    mapping[0] = 3; // Dây 6 (E), ngăn 3: ngón trỏ
    mapping[1] = 2; // Dây 5 (A), ngăn 2: ngón giữa
    mapping[5] = 4; // Dây 1 (E), ngăn 3: ngón áp út
    return mapping;
  }
  
  // Hợp âm F chuẩn: [1, 3, 3, 2, 1, 1] với barre
  if (chordName === 'F' && frets[0] === 1 && frets[1] === 3 && frets[2] === 3 && frets[3] === 2 && frets[4] === 1 && frets[5] === 1) {
    // Barre ngăn 1: ngón trỏ
    mapping[0] = 1; // Dây 6
    mapping[1] = 3; // Dây 5  
    mapping[2] = 4; // Dây 4
    mapping[3] = 2; // Dây 3
    mapping[4] = 1; // Dây 2
    mapping[5] = 1; // Dây 1
    return mapping;
  }
  
  // Hợp âm Bdim chuẩn: ["x", 2, 0, 4, 0, 1] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'Bdim' && JSON.stringify(frets) === JSON.stringify(["x", 2, 0, 4, 0, 1])) {
    mapping[1] = 2; // Dây 5 (A), ngăn 2: ngón giữa
    mapping[3] = 4; // Dây 3 (G), ngăn 4: ngón út
    mapping[5] = 1; // Dây 1 (E), ngăn 1: ngón trỏ
    return mapping;
  }
  
  // Hợp âm Bdim thế tay khác: [0, 2, 3, 2, 3, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'Bdim' && JSON.stringify(frets) === JSON.stringify([0, 2, 3, 2, 3, 0])) {
    mapping[1] = 1; // Dây 5 (A), ngăn 2: ngón trỏ
    mapping[2] = 2; // Dây 4 (D), ngăn 3: ngón giữa
    mapping[3] = 3; // Dây 3 (G), ngăn 2: ngón áp út
    mapping[4] = 4; // Dây 2 (B), ngăn 3: ngón út
    return mapping;
  }
  
  // Hợp âm Bm chuẩn: ["x", 2, 4, 4, 3, 2] với barre ngăn 2 (E6, A5, D4, G3, B2, E1)
  if (chordName === 'Bm' && JSON.stringify(frets) === JSON.stringify(["x", 2, 4, 4, 3, 2])) {
    // Barre ngăn 2: ngón trỏ (1) - chỉ hiển thị đường barre, không hiển thị số
    // Các nốt khác:
    mapping[4] = 2; // Dây 2 (B), ngăn 3: ngón giữa
    mapping[2] = 3; // Dây 4 (D), ngăn 4: ngón áp út
    mapping[3] = 4; // Dây 3 (G), ngăn 4: ngón út
    return mapping;
  }
  
  // Hợp âm C7 chuẩn: [0, 3, 2, 0, 1, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'C7' && JSON.stringify(frets) === JSON.stringify([0, 3, 2, 0, 1, 0])) {
    mapping[4] = 1; // Dây 2 (B), ngăn 1: ngón trỏ
    mapping[2] = 2; // Dây 4 (D), ngăn 2: ngón giữa
    mapping[1] = 3; // Dây 5 (A), ngăn 3: ngón áp út
    return mapping;
  }
  
  // Hợp âm D7 chuẩn: [0, 0, 2, 1, 2, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'D7' && JSON.stringify(frets) === JSON.stringify([0, 0, 2, 1, 2, 0])) {
    mapping[4] = 1; // Dây 2 (B), ngăn 1: ngón trỏ
    mapping[3] = 2; // Dây 3 (G), ngăn 2: ngón giữa
    mapping[2] = 3; // Dây 4 (D), ngăn 2: ngón áp út
    return mapping;
  }
  
  // Hợp âm E7 chuẩn: [0, 2, 0, 1, 0, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'E7' && JSON.stringify(frets) === JSON.stringify([0, 2, 0, 1, 0, 0])) {
    mapping[3] = 1; // Dây 3 (G), ngăn 1: ngón trỏ
    mapping[1] = 2; // Dây 5 (A), ngăn 2: ngón giữa
    return mapping;
  }
  
  // Hợp âm G7 chuẩn: [3, 2, 0, 0, 0, 1] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'G7' && JSON.stringify(frets) === JSON.stringify([3, 2, 0, 0, 0, 1])) {
    mapping[5] = 1; // Dây 1 (E), ngăn 1: ngón trỏ
    mapping[1] = 2; // Dây 5 (A), ngăn 2: ngón giữa
    mapping[0] = 3; // Dây 6 (E), ngăn 3: ngón áp út
    return mapping;
  }
  
  // Hợp âm A7 chuẩn: [0, 0, 2, 0, 2, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'A7' && JSON.stringify(frets) === JSON.stringify([0, 0, 2, 0, 2, 0])) {
    mapping[2] = 1; // Dây 4 (D), ngăn 2: ngón trỏ
    mapping[4] = 2; // Dây 2 (B), ngăn 2: ngón giữa
    return mapping;
  }
  
  // Hợp âm B7 chuẩn: [0, 2, 4, 1, 2, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'B7' && JSON.stringify(frets) === JSON.stringify([0, 2, 4, 1, 2, 0])) {
    mapping[3] = 1; // Dây 3 (G), ngăn 1: ngón trỏ
    mapping[1] = 2; // Dây 5 (A), ngăn 2: ngón giữa
    mapping[4] = 3; // Dây 2 (B), ngăn 2: ngón áp út
    mapping[2] = 4; // Dây 4 (D), ngăn 4: ngón út
    return mapping;
  }
  
  // Hợp âm Am7 chuẩn: [0, 2, 0, 2, 0, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'Am7' && JSON.stringify(frets) === JSON.stringify([0, 2, 0, 2, 0, 0])) {
    mapping[2] = 1; // Dây 4 (D), ngăn 2: ngón trỏ
    mapping[3] = 2; // Dây 3 (G), ngăn 2: ngón giữa
    return mapping;
  }
  
  // Hợp âm Dm7 chuẩn: [0, 0, 2, 1, 1, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'Dm7' && JSON.stringify(frets) === JSON.stringify([0, 0, 2, 1, 1, 0])) {
    mapping[4] = 1; // Dây 2 (B), ngăn 1: ngón trỏ
    mapping[3] = 2; // Dây 3 (G), ngăn 2: ngón giữa
    mapping[2] = 3; // Dây 4 (D), ngăn 2: ngón áp út
    return mapping;
  }
  
  // Hợp âm Em7 chuẩn: [0, 2, 0, 0, 0, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'Em7' && JSON.stringify(frets) === JSON.stringify([0, 2, 0, 0, 0, 0])) {
    mapping[1] = 1; // Dây 5 (A), ngăn 2: ngón trỏ
    return mapping;
  }
  
  // Hợp âm Fmaj7 chuẩn: [0, 3, 3, 2, 1, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'Fmaj7' && JSON.stringify(frets) === JSON.stringify([0, 3, 3, 2, 1, 0])) {
    mapping[4] = 1; // Dây 2 (B), ngăn 1: ngón trỏ
    mapping[3] = 2; // Dây 3 (G), ngăn 2: ngón giữa
    mapping[2] = 3; // Dây 4 (D), ngăn 3: ngón áp út
    mapping[1] = 4; // Dây 5 (A), ngăn 3: ngón út
    return mapping;
  }
  
  // Hợp âm F#dim chuẩn: ["x", "x", 4, 2, 1, 2] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'F#dim' && JSON.stringify(frets) === JSON.stringify(["x", "x", 4, 2, 1, 2])) {
    mapping[2] = 4; // Dây 4 (D), ngăn 4: ngón út
    mapping[3] = 2; // Dây 3 (G), ngăn 2: ngón giữa
    mapping[4] = 1; // Dây 2 (B), ngăn 1: ngón trỏ
    mapping[5] = 3; // Dây 1 (E), ngăn 2: ngón áp út
    return mapping;
  }

  // Hợp âm F#m chuẩn: [2, 4, 4, 2, 2, 2] với barre ngăn 2 và ngăn 4 (E6, A5, D4, G3, B2, E1)
  if (chordName === 'F#m' && JSON.stringify(frets) === JSON.stringify([2, 4, 4, 2, 2, 2])) {
    // Barre ngăn 2: ngón trỏ (1) - chỉ hiển thị đường barre, không hiển thị số
    // Barre ngăn 4: ngón trỏ (1) - chỉ hiển thị đường barre, không hiển thị số
    // Các nốt khác:
    mapping[1] = 3; // Dây 5 (A), ngăn 4: ngón áp út
    mapping[2] = 4; // Dây 4 (D), ngăn 4: ngón út
    return mapping;
  }
  
  // Hợp âm A chuẩn: ["x", 0, 2, 2, 2, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'A' && JSON.stringify(frets) === JSON.stringify(["x", 0, 2, 2, 2, 0])) {
    mapping[2] = 2; // Dây 4 (D), ngăn 2: ngón giữa
    mapping[3] = 3; // Dây 3 (G), ngăn 2: ngón áp út
    mapping[4] = 4; // Dây 2 (B), ngăn 2: ngón út
    return mapping;
  }
  
  // Hợp âm C#dim chuẩn: ["x", 4, 2, 0, 2, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'C#dim' && JSON.stringify(frets) === JSON.stringify(["x", 4, 2, 0, 2, 0])) {
    mapping[1] = 4; // Dây 5 (A), ngăn 4: ngón út
    mapping[2] = 1; // Dây 4 (D), ngăn 2: ngón trỏ
    mapping[4] = 2; // Dây 2 (B), ngăn 2: ngón giữa
    return mapping;
  }
  
  // Hợp âm C#m chuẩn: ["x", 4, 6, 6, 5, 4] với barre ngăn 4 (E6, A5, D4, G3, B2, E1)
  if (chordName === 'C#m' && JSON.stringify(frets) === JSON.stringify(["x", 4, 6, 6, 5, 4])) {
    // Barre ngăn 4: ngón trỏ (1) - chỉ hiển thị đường barre, không hiển thị số
    // Các nốt khác:
    mapping[1] = 1; // Dây 5 (A), ngăn 4: ngón trỏ (barre)
    mapping[2] = 3; // Dây 4 (D), ngăn 6: ngón áp út
    mapping[3] = 4; // Dây 3 (G), ngăn 6: ngón út
    mapping[4] = 2; // Dây 2 (B), ngăn 5: ngón giữa
    mapping[5] = 1; // Dây 1 (E), ngăn 4: ngón trỏ (barre)
    return mapping;
  }
  
  // Hợp âm G#dim chuẩn: ["x", "x", 6, 4, 3, 4] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'G#dim' && JSON.stringify(frets) === JSON.stringify(["x", "x", 6, 4, 3, 4])) {
    mapping[2] = 4; // Dây 4 (D), ngăn 6: ngón út
    mapping[3] = 2; // Dây 3 (G), ngăn 4: ngón giữa
    mapping[4] = 1; // Dây 2 (B), ngăn 3: ngón trỏ
    mapping[5] = 2; // Dây 1 (E), ngăn 4: ngón giữa
    return mapping;
  }
  
  // Hợp âm G#m chuẩn: [4, 6, 6, 4, 4, 4] với barre ngăn 4 (E6, A5, D4, G3, B2, E1)
  if (chordName === 'G#m' && JSON.stringify(frets) === JSON.stringify([4, 6, 6, 4, 4, 4])) {
    // Barre ngăn 4: ngón trỏ (1) - chỉ hiển thị đường barre, không hiển thị số
    // Các nốt khác:
    mapping[0] = 1; // Dây 6 (E), ngăn 4: ngón trỏ (barre)
    mapping[1] = 3; // Dây 5 (A), ngăn 6: ngón áp út (sửa từ 4 thành 3)
    mapping[2] = 4; // Dây 4 (D), ngăn 6: ngón út (sửa từ 1 thành 4)
    mapping[3] = 1; // Dây 3 (G), ngăn 4: ngón trỏ (barre)
    mapping[4] = 1; // Dây 2 (B), ngăn 4: ngón trỏ (barre)
    mapping[5] = 1; // Dây 1 (E), ngăn 4: ngón trỏ (barre)
    return mapping;
  }
  
  // Hợp âm B chuẩn: ["x", 2, 4, 4, 4, 2] với barre ngăn 2 (E6, A5, D4, G3, B2, E1)
  if (chordName === 'B' && JSON.stringify(frets) === JSON.stringify(["x", 2, 4, 4, 4, 2])) {
    // Barre ngăn 2: ngón trỏ (1) - chỉ hiển thị đường barre, không hiển thị số
    // Các nốt khác:
    mapping[1] = 1; // Dây 5 (A), ngăn 2: ngón trỏ (barre)
    mapping[2] = 2; // Dây 4 (D), ngăn 4: ngón giữa (đổi từ 4 thành 2)
    mapping[3] = 3; // Dây 3 (G), ngăn 4: ngón áp út (đổi từ 1 thành 3)
    mapping[4] = 4; // Dây 2 (B), ngăn 4: ngón út (đổi từ 2 thành 4)
    mapping[5] = 1; // Dây 1 (E), ngăn 2: ngón trỏ (barre)
    return mapping;
  }
  
  // Hợp âm D#dim chuẩn: ["x", 6, 7, 8, 7, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'D#dim' && JSON.stringify(frets) === JSON.stringify(["x", 6, 7, 8, 7, 0])) {
    mapping[1] = 1; // Dây 5 (A), ngăn 6: ngón trỏ
    mapping[2] = 2; // Dây 4 (D), ngăn 7: ngón giữa
    mapping[3] = 4; // Dây 3 (G), ngăn 8: ngón út
    mapping[4] = 3; // Dây 2 (B), ngăn 7: ngón áp út
    return mapping;
  }
  
  // Hợp âm D#m chuẩn: ["x", 6, 8, 8, 7, 6] với barre ngăn 6 (E6, A5, D4, G3, B2, E1)
  if (chordName === 'D#m' && JSON.stringify(frets) === JSON.stringify(["x", 6, 8, 8, 7, 6])) {
    // Barre ngăn 6: ngón trỏ (1) - chỉ hiển thị đường barre, không hiển thị số
    // Các nốt khác:
    mapping[1] = 1; // Dây 5 (A), ngăn 6: ngón trỏ (barre)
    mapping[2] = 3; // Dây 4 (D), ngăn 8: ngón áp út (đổi từ 1 thành 3)
    mapping[3] = 4; // Dây 3 (G), ngăn 8: ngón út (đổi từ 2 thành 4)
    mapping[4] = 2; // Dây 2 (B), ngăn 7: ngón giữa (đổi từ 4 thành 2)
    mapping[5] = 1; // Dây 1 (E), ngăn 6: ngón trỏ (barre)
    return mapping;
  }
  
  // Hợp âm F# chuẩn: [2, 4, 4, 3, 2, 2] với barre ngăn 2 (E6, A5, D4, G3, B2, E1)
  if (chordName === 'F#' && JSON.stringify(frets) === JSON.stringify([2, 4, 4, 3, 2, 2])) {
    // Barre ngăn 2: ngón trỏ (1) - chỉ hiển thị đường barre, không hiển thị số
    // Các nốt khác:
    mapping[0] = 1; // Dây 6 (E), ngăn 2: ngón trỏ (barre)
    mapping[1] = 3; // Dây 5 (A), ngăn 4: ngón giữa
    mapping[2] = 4; // Dây 4 (D), ngăn 4: ngón giữa (đổi từ 4 thành 2)
    mapping[3] = 2; // Dây 3 (G), ngăn 3: ngón áp út (đổi từ 2 thành 3)
    mapping[4] = 4; // Dây 2 (B), ngăn 2: ngón út (đổi từ 3 thành 4)
    mapping[5] = 1; // Dây 1 (E), ngăn 2: ngón trỏ (barre)
    return mapping;
  }
  
  // Hợp âm A#dim chuẩn: ["x", 1, 2, 3, 2, 0] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'A#dim' && JSON.stringify(frets) === JSON.stringify(["x", 1, 2, 3, 2, 0])) {
    mapping[1] = 1; // Dây 5 (A), ngăn 1: ngón trỏ
    mapping[2] = 2; // Dây 4 (D), ngăn 2: ngón giữa
    mapping[3] = 4; // Dây 3 (G), ngăn 3: ngón út
    mapping[4] = 3; // Dây 2 (B), ngăn 2: ngón áp út
    return mapping;
  }
  
  // Hợp âm A#m chuẩn: ["x", 1, 3, 3, 2, 1] với barre ngăn 1 (E6, A5, D4, G3, B2, E1)
  if (chordName === 'A#m' && JSON.stringify(frets) === JSON.stringify(["x", 1, 3, 3, 2, 1])) {
    // Barre ngăn 1: ngón trỏ (1) - chỉ hiển thị đường barre, không hiển thị số
    // Các nốt khác:
    mapping[1] = 1; // Dây 5 (A), ngăn 1: ngón trỏ (barre)
    mapping[2] = 4; // Dây 4 (D), ngăn 3: ngón út (đổi từ 1 thành 4)
    mapping[3] = 1; // Dây 3 (G), ngăn 3: ngón trỏ
    mapping[4] = 2; // Dây 2 (B), ngăn 2: ngón giữa
    mapping[5] = 1; // Dây 1 (E), ngăn 1: ngón trỏ (barre)
    return mapping;
  }
  
  // Hợp âm C# chuẩn: ["x", 4, 6, 6, 6, 4] với barre ngăn 4 (E6, A5, D4, G3, B2, E1)
  if (chordName === 'C#' && JSON.stringify(frets) === JSON.stringify(["x", 4, 6, 6, 6, 4])) {
    // Barre ngăn 4: ngón trỏ (1) - chỉ hiển thị đường barre, không hiển thị số
    // Các nốt khác:
    mapping[1] = 1; // Dây 5 (A), ngăn 4: ngón trỏ (barre)
    mapping[2] = 2; // Dây 4 (D), ngăn 6: ngón giữa (đổi từ 4 thành 2)
    mapping[3] = 3; // Dây 3 (G), ngăn 6: ngón áp út (đổi từ 1 thành 3)
    mapping[4] = 4; // Dây 2 (B), ngăn 6: ngón út (đổi từ 2 thành 4)
    mapping[5] = 1; // Dây 1 (E), ngăn 4: ngón trỏ (barre)
    return mapping;
  }
  
  // Hợp âm E#dim chuẩn: ["x", "x", 1, 0, 2, 1] (E6, A5, D4, G3, B2, E1)
  if (chordName === 'E#dim' && JSON.stringify(frets) === JSON.stringify(["x", "x", 1, 0, 2, 1])) {
    mapping[2] = 1; // Dây 4 (D), ngăn 1: ngón trỏ
    mapping[4] = 2; // Dây 2 (B), ngăn 2: ngón giữa
    mapping[5] = 3; // Dây 1 (E), ngăn 1: ngón áp út
    return mapping;
  }
  
  // Hợp âm Gm chuẩn: [3, 5, 5, 3, 3, 0] với barre ngăn 3 (E6, A5, D4, G3, B2, E1)
  if (chordName === 'Gm' && JSON.stringify(frets) === JSON.stringify([3, 5, 5, 3, 3, 0])) {
    // Barre ngăn 3: ngón trỏ (1) - chỉ hiển thị đường barre, không hiển thị số
    // Các nốt khác:
    mapping[0] = 1; // Dây 6 (E), ngăn 3: ngón trỏ (barre)
    mapping[1] = 3; // Dây 5 (A), ngăn 5: ngón áp út
    mapping[2] = 4; // Dây 4 (D), ngăn 5: ngón út
    mapping[3] = 1; // Dây 3 (G), ngăn 3: ngón trỏ (barre)
    mapping[4] = 1; // Dây 2 (B), ngăn 3: ngón trỏ (barre)
    return mapping;
  }
  
  // Hợp âm Bb chuẩn: ["x", 1, 3, 3, 3, 1] với barre ngăn 1 (E6, A5, D4, G3, B2, E1)
  if (chordName === 'Bb' && JSON.stringify(frets) === JSON.stringify(["x", 1, 3, 3, 3, 1])) {
    // Barre ngăn 1: ngón trỏ (1) - chỉ hiển thị đường barre, không hiển thị số
    // Các nốt khác:
    mapping[1] = 1; // Dây 5 (A), ngăn 1: ngón trỏ (barre)
    mapping[2] = 2; // Dây 4 (D), ngăn 3: ngón giữa (đổi từ 3 thành 2)
    mapping[3] = 3; // Dây 3 (G), ngăn 3: ngón áp út (đổi từ 1 thành 3)
    mapping[4] = 4; // Dây 2 (B), ngăn 3: ngón út (đổi từ 2 thành 4)
    mapping[5] = 1; // Dây 1 (E), ngăn 1: ngón trỏ (barre)
    return mapping;
  }
  
  return null; // Không có mapping đặc biệt
}

/**
 * Gán ngón tay cho các nốt theo quy tắc chuẩn
 * @param {Array} notesToAssign - Mảng các nốt cần gán ngón tay
 * @param {Array} fingerMapping - Mảng mapping ngón tay
 */
function assignFingersToNotes(notesToAssign, fingerMapping) {
  // Sắp xếp các nốt theo ngăn (từ thấp đến cao)
  const sortedNotes = notesToAssign.sort((a, b) => a.fret - b.fret);
  
  // Tạo mapping thông minh dựa trên quy tắc guitar chuẩn
  const usedFingers = new Set();
  
  // Gán ngón tay cho từng nốt
  sortedNotes.forEach(note => {
    const fretNum = note.fret;
    let finger = null;
    
    // Quy tắc gán ngón tay chuẩn
    if (fretNum === 1) {
      // Ngăn 1: ưu tiên ngón trỏ (1)
      finger = 1;
    } else if (fretNum === 2) {
      // Ngăn 2: ưu tiên ngón giữa (2)
      finger = 2;
    } else if (fretNum === 3) {
      // Ngăn 3: ưu tiên ngón áp út (3)
      finger = 3;
    } else if (fretNum === 4) {
      // Ngăn 4: ưu tiên ngón út (4)
      finger = 4;
    } else {
      // Ngăn cao hơn: dùng ngón út (4)
      finger = 4;
    }
    
    // Nếu ngón tay đã được sử dụng, tìm ngón tay khác
    if (usedFingers.has(finger)) {
      // Tìm ngón tay khác chưa được sử dụng
      for (let i = 1; i <= 4; i++) {
        if (!usedFingers.has(i)) {
          finger = i;
          break;
        }
      }
    }
    
    // Đánh dấu ngón tay đã được sử dụng
    usedFingers.add(finger);
    fingerMapping[note.stringIndex] = finger;
  });
}

/**
 * Tạo mapping ngón tay cho tất cả hợp âm
 * @param {Object} chords - Object chứa tất cả hợp âm
 * @returns {Object} Object chứa mapping cho từng hợp âm
 */
export function createAllFingerMappings(chords) {
  const mappings = {};
  
  Object.keys(chords).forEach(chordName => {
    mappings[chordName] = createFingerMapping(chords[chordName]);
  });
  
  return mappings;
}
