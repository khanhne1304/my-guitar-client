// Tổng hợp toàn bộ hợp âm Guitar cơ bản
export const guitarChords = {
    C: { frets: [0, 3, 2, 0, 1, 0] },
    Cm: { frets: ["x", 3, 5, 5, 4, 3], barre: { fromString: 5, toString: 1, fret: 3 } },
    D: { frets: ["x", "x", 0, 2, 3, 2] },
    Dm: { frets: ["x", "x", 0, 2, 3, 1] },
    "D#": { frets: ["x", "x", 1, 3, 4, 3] }, // Eb
    Eb: { frets: ["x", "x", 1, 3, 4, 3] }, // alias
    E: { frets: [0, 2, 2, 1, 0, 0] },
    Em: { frets: [0, 2, 2, 0, 0, 0] },
    Em7: { frets: [0, 2, 2, 0, 3, 0] },
    C7: { frets: [0, 3, 2, 0, 1, 0] },
    D7: { frets: [0, 0, 2, 1, 2, 0] },
    E7: { frets: [0, 2, 0, 1, 0, 0] },
    F7: { frets: [1, 3, 3, 2, 1, 1], barre: { fromString: 6, toString: 1, fret: 1 } },
    G7: { frets: [3, 2, 0, 0, 0, 1] },
    B7: { frets: [0, 2, 4, 1, 2, 0] },
    Fmaj7: { frets: [0, 3, 3, 2, 1, 0] },
    F: { frets: [1, 3, 3, 2, 1, 1], barre: { fromString: 6, toString: 1, fret: 1 } },
    Fm: { frets: [1, 3, 3, 1, 1, 1], barre: { fromString: 6, toString: 1, fret: 1 } },
    "F#": { frets: [2, 4, 4, 3, 2, 2], barre: { fromString: 6, toString: 1, fret: 2 } }, // Gb
    Gb: { frets: [2, 4, 4, 3, 2, 2], barre: { fromString: 6, toString: 1, fret: 2 } }, // alias
    G: { frets: [3, 2, 0, 0, 0, 3] },
    Gm: { frets: [3, 5, 5, 3, 3, 0], barre: { fromString: 6, toString: 1, fret: 3 } },
    A: { frets: ["x", 0, 2, 2, 2, 0] },
    A7: { frets: ["x", 0, 2, 0, 2, 0] },
    Am: { frets: ["x", 0, 2, 2, 1, 0] },
    Am7: { frets: ["x", 0, 2, 0, 1, 0] },
    Dm7: { frets: [0, 0, 2, 1, 1, 0] },
    "A#": { frets: ["x", 1, 3, 3, 3, 1], barre: { fromString: 5, toString: 1, fret: 1 } }, // Bb
    Bb: { frets: ["x", 1, 3, 3, 3, 1], barre: { fromString: 5, toString: 1, fret: 1 } },
    "A#m": { frets: ["x", 1, 3, 3, 2, 1], barre: { fromString: 5, toString: 1, fret: 1 } }, // Bbm
    B: { frets: ["x", 2, 4, 4, 4, 2], barre: { fromString: 5, toString: 1, fret: 2 } },
    Bm: { frets: ["x", 2, 4, 4, 3, 2], barre: { fromString: 5, toString: 1, fret: 2 } },
    "C#": { frets: ["x", 4, 6, 6, 6, 4], barre: { fromString: 5, toString: 1, fret: 4 } }, // Db
    Db: { frets: ["x", 4, 6, 6, 6, 4], barre: { fromString: 5, toString: 1, fret: 4 } },
    "C#m": { frets: ["x", 4, 6, 6, 5, 4], barre: { fromString: 5, toString: 1, fret: 4 } },
    "D#m": { frets: ["x", 6, 8, 8, 7, 6], barre: { fromString: 5, toString: 1, fret: 6 } }, // Ebm
    Ebm: { frets: ["x", 6, 8, 8, 7, 6], barre: { fromString: 5, toString: 1, fret: 6 } },
    "F#m": { frets: [2, 4, 4, 2, 2, 2], barre: { fromString: 6, toString: 1, fret: 2 } },
    "G#m": { frets: [4, 6, 6, 4, 4, 4], barre: { fromString: 6, toString: 1, fret: 4 } },
    "Adim": { frets: ["x", 0, 1, 2, 1, "x"] },
    "Ddim": { frets: ["x", "x", 0, 1, 0, 1] },
    "Ab": { frets: [4, 6, 6, 5, 4, 4], barre: { fromString: 6, toString: 1, fret: 4 } },
    "Bbm": { frets: ["x", 1, 3, 3, 2, 1], barre: { fromString: 5, toString: 1, fret: 1 } },
    "Gdim": { frets: ["x", "x", 0, 1, 0, 1] },
    "Cdim": { frets: ["x", 3, 4, 2, 4, 2] },
    "Abm": { frets: [4, 6, 6, 4, 4, 4], barre: { fromString: 6, toString: 1, fret: 4 } },
    "Cb": { frets: ["x", 2, 4, 4, 4, 2], barre: { fromString: 5, toString: 1, fret: 2 } },
    "Fdim": { frets: ["x", "x", 3, 4, 3, 4] },
    "Dbm": { frets: ["x", 4, 6, 6, 5, 4], barre: { fromString: 5, toString: 1, fret: 4 } },
    "Bbdim": { frets: ["x", "x", 0, 1, 0, 1] },
    "Fb": { frets: [0, 2, 2, 1, 0, 0] },

    "Edim": { frets: ["x", "x", 2, 3, 2, 3] },
    // Hợp âm giảm (dim)
    "A#dim": { frets: ["x", 1, 2, 3, 2, 0] },
    "Bdim": { frets: ["x", 2, 0, 4, 0, 1] },
    "C#dim": { frets: ["x", 4, 2, 0, 2, 0] },
    "D#dim": { frets: ["x", 6, 7, 8, 7, 0] },
    "E#dim": { frets: ["x", "x", 1, 0, 2, 1] }, // tương đương Fdim
    "F#dim": { frets: ["x", "x", 4, 2, 1, 2] },
    "G#dim": { frets: ["x", "x", 6, 4, 3, 4] },
};

// Helper: mở rộng các hợp âm 7 và slash A/B bằng alias về dạng cơ bản
function extendSeventhAndSlash(dict) {
  const bases = Object.keys(dict);
  const result = { ...dict };
  const sevens = ["7", "maj7", "m7", "dim7", "mMaj7"]; // ánh xạ đơn giản: dùng hình/notes cơ bản

  bases.forEach((b) => {
    // Tạo alias cho slash: ví dụ C/E, G/B ... đều trỏ về hình C, G
    bases.forEach((bass) => {
      const slash = `${b}/${bass}`;
      if (!result[slash]) result[slash] = dict[b];
    });
    // Tạo alias cho hợp âm 7 phổ biến trỏ về dạng thường nếu chưa có
    sevens.forEach((suf) => {
      const name = `${b}${suf}`;
      if (!result[name]) result[name] = dict[b];
    });
  });
  return result;
}

export const extendedGuitarChords = extendSeventhAndSlash(guitarChords);