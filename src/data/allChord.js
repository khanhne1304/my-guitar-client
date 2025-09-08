// Tổng hợp toàn bộ hợp âm Guitar & Piano cơ bản
export const guitarChords = {
    C: { frets: [0, 3, 2, 0, 1, 0] },
    Cm: { frets: ["x", 3, 5, 5, 4, 3], barre: { fromString: 5, toString: 1, fret: 3 } },
    D: { frets: ["x", "x", 0, 2, 3, 2] },
    Dm: { frets: ["x", "x", 0, 2, 3, 1] },
    "D#": { frets: ["x", "x", 1, 3, 4, 3] }, // Eb
    Eb: { frets: ["x", "x", 1, 3, 4, 3] }, // alias
    E: { frets: [0, 2, 2, 1, 0, 0] },
    Em: { frets: [0, 2, 2, 0, 0, 0] },
    F: { frets: [1, 3, 3, 2, 1, 1], barre: { fromString: 6, toString: 1, fret: 1 } },
    Fm: { frets: [1, 3, 3, 1, 1, 1], barre: { fromString: 6, toString: 1, fret: 1 } },
    "F#": { frets: [2, 4, 4, 3, 2, 2], barre: { fromString: 6, toString: 1, fret: 2 } }, // Gb
    Gb: { frets: [2, 4, 4, 3, 2, 2], barre: { fromString: 6, toString: 1, fret: 2 } }, // alias
    G: { frets: [3, 2, 0, 0, 0, 3] },
    Gm: { frets: [3, 5, 5, 3, 3, 3], barre: { fromString: 6, toString: 1, fret: 3 } },
    A: { frets: ["x", 0, 2, 2, 2, 0] },
    Am: { frets: ["x", 0, 2, 2, 1, 0] },
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
    "A#dim": { frets: ["x", 1, 2, 0, 2, 0] },
    "Bdim": { frets: ["x", 2, 3, 1, 3, 1] },
    "C#dim": { frets: ["x", 4, 5, 3, 5, 3] },
    "D#dim": { frets: ["x", 6, 7, 5, 7, 5] },
    "E#dim": { frets: ["x", 7, 8, 6, 8, 6] }, // tương đương Fdim
    "F#dim": { frets: ["x", "x", 4, 5, 4, 5] },
    "G#dim": { frets: ["x", "x", 6, 7, 6, 7] },
};

// Piano
export const pianoChords = {
    C: ["C", "E", "G"],
    "Abm": ["G#", "B", "D#"],   // Abm = G#m
    "Fdim": ["F", "G#", "B"],
    "Cb": ["B", "D#", "F#"],    // enharmonic với B major
    "Ab": ["G#", "C", "D#"],
    "Gdim": ["G", "A#", "C#"],
    "F#m": ["F#", "A", "C#"],
    "G#m": ["G#", "B", "D#"],
    "Edim": ["E", "G", "A#"],   // A# ≡ Bb
    Cm: ["C", "D#", "G"],
    D: ["D", "F#", "A"],
    Dm: ["D", "F", "A"],
    "Adim": ["A", "C", "D#"],
    "Ddim": ["D", "F", "G#"],
    "Cdim": ["C", "D#", "F#"],
    "Dbm": ["C#", "E", "G#"],   // enharmonic Dbm = C#m
    "Fb": ["E", "G#", "B"],     // Fb ≡ E
    "Bbdim": ["A#", "C#", "E"], // Bb ≡ A#, Fb ≡ E
    "D#": ["D#", "G", "A#"], Eb: ["D#", "G", "A#"],
    E: ["E", "G#", "B"],
    Em: ["E", "G", "B"],
    F: ["F", "A", "C"],
    Fm: ["F", "G#", "C"],
    "F#": ["F#", "A#", "C#"], Gb: ["F#", "A#", "C#"],
    G: ["G", "B", "D"],
    Gm: ["G", "A#", "D"],
    A: ["A", "C#", "E"],
    Am: ["A", "C", "E"],
    "A#": ["A#", "D", "F"], Bb: ["A#", "D", "F"],
    "A#m": ["A#", "C#", "F"], Bbm: ["A#", "C#", "F"],
    B: ["B", "D#", "F#"],
    Bm: ["B", "D", "F#"],
    "C#": ["C#", "F", "G#"], Db: ["C#", "F", "G#"],
    "C#m": ["C#", "E", "G#"],
    "D#m": ["D#", "F#", "A#"], Ebm: ["D#", "F#", "A#"],

    // dim
    "A#dim": ["A#", "C#", "E"],
    "Bdim": ["B", "D", "F"],
    "C#dim": ["C#", "E", "G"],
    "D#dim": ["D#", "F#", "A"],
    "E#dim": ["E#", "G#", "B"], // tương đương Fdim
    "F#dim": ["F#", "A", "C"],
    "G#dim": ["G#", "B", "D"],
};
