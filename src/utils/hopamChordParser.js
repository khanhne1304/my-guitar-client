import chordLibrary from '../data/chordData.json';
import { transposeChord } from './transposeChord';

export { chordLibrary };

const NUM_STRINGS = 6;
const DISPLAY_FRETS = 4;

const SHARP_TO_FLAT = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
const FLAT_TO_SHARP = Object.fromEntries(
  Object.entries(SHARP_TO_FLAT).map(([sharp, flat]) => [flat, sharp]),
);

function chordAliases(chordName) {
  const base = String(chordName || '').split('/')[0].trim();
  if (!base) return [];

  const m = base.match(/^([A-G][#b]?)(.*)$/i);
  if (!m) return [base];

  const root = m[1].charAt(0).toUpperCase() + m[1].slice(1);
  const suffix = m[2] || '';
  const normalized = `${transposeChord(root, 0)}${suffix}`;
  const aliases = new Set([base, normalized]);

  const sharpRoot = transposeChord(root, 0);
  if (SHARP_TO_FLAT[sharpRoot]) aliases.add(`${SHARP_TO_FLAT[sharpRoot]}${suffix}`);
  if (FLAT_TO_SHARP[root]) aliases.add(`${FLAT_TO_SHARP[root]}${suffix}`);

  return [...aliases];
}

function buildLookupKeys(chordName, transpose = 0) {
  const keys = new Set(chordAliases(chordName));
  if (transpose) {
    chordAliases(chordName).forEach((alias) => {
      keys.add(transposeChord(alias, -transpose));
      chordAliases(transposeChord(alias, -transpose)).forEach((k) => keys.add(k));
    });
  }
  return [...keys];
}

function splitScheme(value) {
  const raw = String(value || '').trim();
  if (!raw) return [];
  return raw.includes('.') ? raw.split('.') : raw.split('');
}

/**
 * Parse một dòng thế tay HopAmChuan: "022000/012000" hoặc "x.3.2.0.1.0/0.3.2.0.1.0"
 */
export function parseHopamVoicingLine(line) {
  const trimmed = String(line || '').trim();
  if (!trimmed) return null;

  const [schemeRaw, fingersRaw = ''] = trimmed.split('/');
  const scheme = splitScheme(schemeRaw);
  const fingers = splitScheme(fingersRaw);

  if (scheme.length !== NUM_STRINGS) return null;

  return {
    scheme: scheme.map((f) => {
      const lower = String(f).toLowerCase();
      if (lower === 'x') return 'x';
      const num = Number(f);
      return Number.isFinite(num) ? num : 'x';
    }),
    fingers: fingers.length === NUM_STRINGS ? fingers : scheme.map(() => ''),
  };
}

/**
 * Parse trường details từ CHORDS_DATA HopAmChuan.
 */
export function parseHopamDetails(details) {
  if (!details) return [];
  return String(details)
    .split(/\n/)
    .map((line) => parseHopamVoicingLine(line))
    .filter(Boolean);
}

export function getHopamChordEntry(chordName, chordsDataMap, transpose = 0) {
  const lookupKeys = buildLookupKeys(chordName, transpose);
  if (!lookupKeys.length) return null;

  const sources = [chordsDataMap, chordLibrary].filter(Boolean);
  for (const source of sources) {
    for (const key of lookupKeys) {
      if (source[key]) return { name: key, ...source[key] };
    }
  }
  return null;
}

export function getHopamVoicings(chordName, chordsDataMap, transpose = 0) {
  const entry = getHopamChordEntry(chordName, chordsDataMap, transpose);
  if (!entry?.details) return [];
  return parseHopamDetails(entry.details);
}

function playedFrets(scheme) {
  return scheme
    .filter((f) => f !== 'x' && typeof f === 'number')
    .map((f) => (f === 0 ? 1 : f));
}

/**
 * Tính ngăn gốc (base fret) giống ChordJS của HopAmChuan.
 */
export function getHopamBaseFret(scheme) {
  const frets = playedFrets(scheme);
  if (!frets.length) return 1;

  const minFret = Math.min(...frets);
  const maxFret = Math.max(...frets);
  if (maxFret > DISPLAY_FRETS) return maxFret - DISPLAY_FRETS + 1;
  return minFret === 1 ? 1 : minFret;
}

/**
 * Chuyển thế tay HopAmChuan sang dạng { frets, barre } dùng cho VirtualGuitarNeck.
 */
export function hopamVoicingToShape(voicing) {
  if (!voicing) return null;

  const frets = voicing.scheme.map((f) => {
    if (f === 'x') return 'x';
    return f;
  });

  const barreCandidates = {};

  voicing.fingers.forEach((finger, idx) => {
    const fret = frets[idx];
    if (finger === '1' && typeof fret === 'number' && fret > 0) {
      barreCandidates[fret] = (barreCandidates[fret] || 0) + 1;
    }
  });

  let barre = null;
  const barreFret = Object.entries(barreCandidates).find(([, count]) => count >= 3)?.[0];
  if (barreFret) {
    const fretNum = Number(barreFret);
    const stringIndices = frets
      .map((f, i) => (f === fretNum ? NUM_STRINGS - i : null))
      .filter((s) => s != null);
    if (stringIndices.length >= 2) {
      barre = {
        fret: fretNum,
        fromString: Math.max(...stringIndices),
        toString: Math.min(...stringIndices),
      };
    }
  }

  return { frets, barre, fingers: voicing.fingers };
}

export function getChordShape(chordName, chordsDataMap, transpose = 0) {
  const voicings = getHopamVoicings(chordName, chordsDataMap, transpose);
  return hopamVoicingToShape(voicings[0]);
}

function extendSeventhAndSlash(dict) {
  const bases = Object.keys(dict);
  const result = { ...dict };
  const sevens = ['7', 'maj7', 'm7', 'dim7', 'mMaj7'];

  bases.forEach((b) => {
    bases.forEach((bass) => {
      const slash = `${b}/${bass}`;
      if (!result[slash]) result[slash] = dict[b];
    });
    sevens.forEach((suf) => {
      const name = `${b}${suf}`;
      if (!result[name]) result[name] = dict[b];
    });
  });
  return result;
}

function buildGuitarChordsFromLibrary() {
  const base = {};
  Object.keys(chordLibrary).forEach((name) => {
    const shape = getChordShape(name);
    if (shape) {
      base[name] = { frets: shape.frets, barre: shape.barre };
    }
  });
  return base;
}

export const extendedGuitarChords = extendSeventhAndSlash(buildGuitarChordsFromLibrary());
