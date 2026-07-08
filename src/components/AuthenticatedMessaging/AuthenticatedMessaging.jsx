import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ChatWidget from "../../views/components/chat/ChatWidget";
import {
	startMessageRealtime,
	stopMessageRealtime,
} from "../../services/messageRealtime";
import { disconnectPresenceSocket } from "../../services/presenceSocket";

/** Socket tin nhắn + widget chat — luôn bật khi user đã đăng nhập. */
export default function AuthenticatedMessaging() {
	const { isAuthenticated, authChecked } = useAuth();

	useEffect(() => {
		if (!authChecked) return undefined;
		if (!isAuthenticated) {
			stopMessageRealtime();
			disconnectPresenceSocket();
			return undefined;
		}
		startMessageRealtime();
		return () => stopMessageRealtime();
	}, [isAuthenticated, authChecked]);

	if (!authChecked || !isAuthenticated) return null;

	return <ChatWidget />;
}
