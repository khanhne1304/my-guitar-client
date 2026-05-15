import { apiClient } from './apiClient';

export async function searchHopamSongs(query) {
  const params = new URLSearchParams({ q: query });
  const res = await apiClient.get(`/hopam/search?${params.toString()}`);
  return res?.data ?? [];
}

export async function fetchHopamSong(url) {
  const params = new URLSearchParams({ url });
  const res = await apiClient.get(`/hopam/song?${params.toString()}`);
  return res?.data ?? null;
}
