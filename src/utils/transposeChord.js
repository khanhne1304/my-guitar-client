const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_MAP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

function toSharpRoot(root) {
  const r = root.charAt(0).toUpperCase() + root.slice(1);
  return FLAT_MAP[r] || r.replace('b', '#');
}

export function transposeChord(chord, semitones) {
  const c = String(chord || '').trim();
  const m = c.match(/^([A-G][#b]?)(.*)$/i);
  if (!m) return c;

  const root = toSharpRoot(m[1]);
  const suffix = m[2] || '';
  const idx = ROOTS.indexOf(root);
  if (idx < 0) return c;

  const next = ROOTS[(idx + semitones + 48) % 12];
  return `${next}${suffix}`;
}

export function transposeSongData(song, semitones) {
  if (!song || !semitones) return song;

  const mapChord = (ch) => transposeChord(ch, semitones);

  const chordsData = {};
  if (song.chordsData) {
    for (const [name, entry] of Object.entries(song.chordsData)) {
      chordsData[mapChord(name)] = entry;
    }
  }

  return {
    ...song,
    key: song.key ? mapChord(song.key) : song.key,
    chords: (song.chords || []).map(mapChord),
    progression: (song.progression || []).map(mapChord),
    chordsData,
    lines: (song.lines || []).map((line) => {
      if (line.kind !== 'line') return line;
      const segments = (line.segments || []).map((seg) =>
        seg.type === 'chord' ? { ...seg, text: mapChord(seg.text) } : seg,
      );
      const chordMarks = [];
      let lyricLen = 0;
      for (const seg of segments) {
        if (seg.type === 'chord') chordMarks.push({ chord: seg.text, at: lyricLen });
        else lyricLen += seg.text.length;
      }
      const slots = new Array(Math.min(Math.max(lyricLen + 32, 32), 240)).fill(' ');
      for (const mark of chordMarks) {
        const pos = Math.min(mark.at, slots.length - mark.chord.length - 1);
        for (let i = 0; i < mark.chord.length; i += 1) {
          const idx = pos + i;
          if (idx >= 0 && idx < slots.length) slots[idx] = mark.chord[i];
        }
      }
      const chordLine = slots.join('').trimEnd() || line.chordLine;
      return { ...line, segments, chordLine };
    }),
    lyrics: (song.lyrics || '').replace(/\[([^\]]+)\]/g, (_, ch) => `[${mapChord(ch)}]`),
  };
}
