// src/utils/storage.js

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  ADMIN_VIEW_MODE: 'adminViewMode',
};

/** @typedef {'customer' | 'admin'} AdminViewMode */

// ---- TOKEN ----
export function setToken(token) {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }
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

const LEGACY_CHAT_KEY = 'gm.chat.conversations';

export function clearChatCache() {
  try {
    localStorage.removeItem(LEGACY_CHAT_KEY);
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  removeToken();
  removeUser();
  removeAdminViewMode();
  clearChatCache();
}

// ---- ADMIN VIEW MODE ----
/** @returns {AdminViewMode | null} */
export function getAdminViewMode() {
  const mode = localStorage.getItem(STORAGE_KEYS.ADMIN_VIEW_MODE);
  return mode === 'customer' || mode === 'admin' ? mode : null;
}

/** @param {AdminViewMode} mode */
export function setAdminViewMode(mode) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_VIEW_MODE, mode);
}

export function removeAdminViewMode() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_VIEW_MODE);
}

// ---- UTILS ----
// Hợp nhất user mới và user cũ (ưu tiên giá trị mới)
export function mergeUser(newUser, existingUser) {
  if (!newUser && !existingUser) return null;
  return { ...(existingUser || {}), ...(newUser || {}) };
}

// ---- FAVORITES ----
// Xóa toàn bộ danh sách favorites trong localStorage
// (bao gồm cả guest và user)
export function clearAllFavorites() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('favorites_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing favorites from storage:', error);
  }
}
