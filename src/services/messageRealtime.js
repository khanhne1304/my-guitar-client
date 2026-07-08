import { getPresenceSocket } from './presenceSocket';
import { getToken } from '../utils/storage';

export const MESSAGE_REALTIME_EVENT = 'gm:message:new';
export const CHAT_OPENED_EVENT = 'gm:chat:opened';
export const CHAT_CLOSED_EVENT = 'gm:chat:closed';

let started = false;
let attachedSocket = null;

function dispatchMessage(payload) {
	window.dispatchEvent(new CustomEvent(MESSAGE_REALTIME_EVENT, { detail: payload }));
}

function onMessageNew(payload) {
	dispatchMessage(payload);
}

function onSocketConnect() {
	if (!started) return;
	attachSocketListeners();
}

function detachFromSocket(sock) {
	if (!sock) return;
	sock.off('message:new', onMessageNew);
	sock.off('connect', onSocketConnect);
}

function attachSocketListeners() {
	const socket = getPresenceSocket();
	if (!socket) return;

	if (attachedSocket && attachedSocket !== socket) {
		detachFromSocket(attachedSocket);
	}

	attachedSocket = socket;
	socket.off('message:new', onMessageNew);
	socket.on('message:new', onMessageNew);
	socket.off('connect', onSocketConnect);
	socket.on('connect', onSocketConnect);
}

export function startMessageRealtime() {
	if (!getToken()) return;
	started = true;
	attachSocketListeners();
}

export function stopMessageRealtime() {
	started = false;
	if (attachedSocket) {
		detachFromSocket(attachedSocket);
		attachedSocket = null;
	}
}
