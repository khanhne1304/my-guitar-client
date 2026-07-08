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

  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    try { socket.disconnect(); } catch {}
    socket = null;
  }

  lastToken = token;
  socket = createSocket(token);
  return socket;
}

export function reconnectPresenceSocket() {
  if (socket) {
    try { socket.disconnect(); } catch {}
    socket = null;
    lastToken = null;
  }
  return getPresenceSocket();
}

export function disconnectPresenceSocket() {
  if (!socket) return;
  try { socket.disconnect(); } catch {}
  socket = null;
  lastToken = null;
}
