// src/helpers/songHelpers.js

// Tách hợp âm từ lyrics
export function extractChordsFromLyrics(lyrics) {
  const chordRegex = /\[([A-G][#b]?m?(?:maj7|m7|7|sus4|dim|add9)?)\]/g;
  const found = [];
  let match;
  while ((match = chordRegex.exec(lyrics)) !== null) {
    found.push(match[1]);
  }
  return [...new Set(found)];
}

// Tìm bài hát liên quan
export function findRelatedSongs(song, allSongs) {
  return allSongs.filter(
    (s) => s.slug !== song.slug && s.artists.some((a) => song.artists.includes(a))
  );
}
