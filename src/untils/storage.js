// src/utils/storage.js
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

export function saveSession({ token, user }) {
  if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
