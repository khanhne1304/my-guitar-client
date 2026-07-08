import { io } from 'socket.io-client';
import { getToken } from '../utils/storage';

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';

function getOrigin() {
  return API_BASE.replace(/\/api\/?$/, '');
}

let socket = null;
let lastToken = null;

function createSocket(token) {
  const origin = getOrigin();
  return io(origin, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });
}

/**
 * Trả về socket dùng chung (presence, forum, tin nhắn).
 * Không hủy socket đang connecting — tránh race làm mất listener realtime.
 */
export function getPresenceSocket() {
  const token = getToken();
  if (!token) {
    return socket;
  }

  if (socket && lastToken !== token) {
    try { socket.disconnect(); } catch {}
    socket = null;
    lastToken = null;
  }

  if (!socket) {
    lastToken = token;
    socket = createSocket(token);
  }

  return socket;
}

/** Buộc tạo kết nối mới (đổi token / recover sau lỗi). */
export function reconnectPresenceSocket() {
  const token = getToken();
  if (socket) {
    try { socket.disconnect(); } catch {}
    socket = null;
  }
  lastToken = null;
  if (!token) return null;
  lastToken = token;
  socket = createSocket(token);
  return socket;
}

export function disconnectPresenceSocket() {
  if (!socket) return;
  try { socket.disconnect(); } catch {}
  socket = null;
  lastToken = null;
}
