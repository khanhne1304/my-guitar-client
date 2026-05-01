import { io } from 'socket.io-client';
import { getToken } from '../utils/storage';

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';

function getOrigin() {
  return API_BASE.replace(/\/api\/?$/, '');
}

let socket = null;

export function getPresenceSocket() {
  const token = getToken();
  const origin = getOrigin();

  if (socket && socket.connected) return socket;
  if (socket) {
    try { socket.disconnect(); } catch {}
    socket = null;
  }

  socket = io(origin, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket'],
    withCredentials: true,
  });

  return socket;
}

export function disconnectPresenceSocket() {
  if (!socket) return;
  try { socket.disconnect(); } catch {}
  socket = null;
}

