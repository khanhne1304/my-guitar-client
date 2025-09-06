// src/utils/storage.js

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

// ---- TOKEN ----
export function setToken(token) {
  if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
}

export function removeToken() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

// ---- USER ----
export function setUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
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

export function removeUser() {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// ---- SESSION ----
export function saveSession({ token, user }) {
  if (token) setToken(token);
  if (user) setUser(user);
}

export function clearSession() {
  removeToken();
  removeUser();
}

// ---- UTILS ----
// Hợp nhất user mới và user cũ (ưu tiên giá trị mới)
export function mergeUser(newUser, existingUser) {
  if (!newUser && !existingUser) return null;
  return { ...(existingUser || {}), ...(newUser || {}) };
}
