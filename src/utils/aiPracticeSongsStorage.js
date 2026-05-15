const STORAGE_KEY = 'ai-guitar-practice-songs';

export function loadPracticeSongs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePracticeSongs(songs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

/** @param {{ url: string, title: string, artist?: string, image?: string }} item */
export function addPracticeSong(item) {
  const songs = loadPracticeSongs();
  if (songs.some((s) => s.url === item.url)) {
    return { ok: false, reason: 'duplicate' };
  }
  const entry = {
    id: item.url,
    url: item.url,
    title: item.title,
    artist: item.artist || '',
    image: item.image || '',
    addedAt: Date.now(),
  };
  savePracticeSongs([entry, ...songs]);
  return { ok: true, song: entry };
}

export function removePracticeSong(id) {
  const songs = loadPracticeSongs().filter((s) => s.id !== id);
  savePracticeSongs(songs);
  return songs;
}
