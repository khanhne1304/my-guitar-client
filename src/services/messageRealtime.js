import { getPresenceSocket, reconnectPresenceSocket } from './presenceSocket';
import { getToken } from '../utils/storage';

export const MESSAGE_REALTIME_EVENT = 'gm:message:new';
export const CHAT_OPENED_EVENT = 'gm:chat:opened';
export const CHAT_CLOSED_EVENT = 'gm:chat:closed';

let started = false;
let socketHandler = null;
let connectHandler = null;

function dispatchMessage(payload) {
	window.dispatchEvent(new CustomEvent(MESSAGE_REALTIME_EVENT, { detail: payload }));
}

function attachSocketListeners(socket) {
	if (!socket) return;
	if (socketHandler) {
		socket.off('message:new', socketHandler);
	}
	socketHandler = (payload) => dispatchMessage(payload);
	socket.on('message:new', socketHandler);

	if (connectHandler) {
		socket.off('connect', connectHandler);
	}
	connectHandler = () => {
		if (socketHandler) {
			socket.off('message:new', socketHandler);
			socket.on('message:new', socketHandler);
		}
	};
	socket.on('connect', connectHandler);
}

export function startMessageRealtime() {
	if (!getToken()) return;
	if (started) {
		attachSocketListeners(getPresenceSocket());
		return;
	}
	started = true;
	const socket = reconnectPresenceSocket();
	attachSocketListeners(socket);
}

export function stopMessageRealtime() {
	started = false;
	const socket = getPresenceSocket();
	if (socket && socketHandler) {
		socket.off('message:new', socketHandler);
	}
	if (socket && connectHandler) {
		socket.off('connect', connectHandler);
	}
	socketHandler = null;
	connectHandler = null;
}
