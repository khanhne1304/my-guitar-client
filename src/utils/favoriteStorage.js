const GUEST_KEY = 'favorites_guest';

function userKey(userId) {
  return `favorites_user_${userId}`;
}

export function resolveUserId(user) {
  if (!user) return null;
  return user.id || user._id || null;
}

export function getStoredFavorites(userId = null) {
  try {
    const key = userId ? userKey(userId) : GUEST_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setStoredFavorites(items, userId = null) {
  try {
    const key = userId ? userKey(userId) : GUEST_KEY;
    localStorage.setItem(key, JSON.stringify(items || []));
  } catch (error) {
    console.error('Error saving favorites to storage:', error);
  }
}

export function clearStoredFavorites(userId = null) {
  try {
    const key = userId ? userKey(userId) : GUEST_KEY;
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
