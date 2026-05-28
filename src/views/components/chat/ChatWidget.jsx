import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./ChatWidget.module.css";
import { apiClient } from "../../../services/apiClient";
import {
	getConversationsApi,
	getThreadMessagesApi,
	getUnreadMessagesCountApi,
	sendDirectMessageApi,
} from "../../../services/messageService";
import { getToken } from "../../../utils/storage";

const LEGACY_CHAT_KEY = "gm.chat.conversations";

function normalizeId(id) {
	if (id == null) return "";
	return String(id);
}

function draftConversation(peer) {
	const id = normalizeId(peer.id);
	const now = Date.now();
	return {
		user: {
			id,
			name: peer.name || "Người dùng",
			avatar: peer.avatar || "",
		},
		lastAt: now,
		lastPreview: "",
		lastFromMe: false,
		unread: 0,
		messages: null,
	};
}

function mergePeerIntoConversations(list, peer) {
	if (!peer?.id) return list;
	const id = normalizeId(peer.id);
	if (list.some((c) => normalizeId(c.user.id) === id)) return list;
	return [draftConversation(peer), ...list];
}

function mapConversation(row) {
	return {
		user: {
			id: normalizeId(row.user?.id),
			name: row.user?.name || "Người dùng",
			avatar: apiClient.ensureAbsolute(row.user?.avatarUrl) || "",
		},
		lastAt: row.lastAt ? new Date(row.lastAt).getTime() : Date.now(),
		lastPreview: row.lastMessage?.text || "",
		lastFromMe: !!row.lastMessage?.fromMe,
		unread: row.unread || 0,
		messages: null,
	};
}

function mapMessage(m) {
	return {
		id: m.id,
		from: m.fromMe ? "me" : "them",
		text: m.text,
		at: m.at ? new Date(m.at).getTime() : Date.now(),
	};
}

export default function ChatWidget() {
	const [open, setOpen] = useState(false);
	const [conversations, setConversations] = useState([]);
	const [selectedUserId, setSelectedUserId] = useState(null);
	const [draft, setDraft] = useState("");
	const [search, setSearch] = useState("");
	const [loadingList, setLoadingList] = useState(false);
	const [loadingThread, setLoadingThread] = useState(false);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState("");
	const [threadError, setThreadError] = useState("");
	/** Người đang mở chat (giữ khi API chưa có cuộc trò chuyện) */
	const [activePeer, setActivePeer] = useState(null);
	const [unreadTotal, setUnreadTotal] = useState(0);

	const inputRef = useRef(null);
	const listRef = useRef(null);
	const pendingPeerRef = useRef(null);
	const selectedUserIdRef = useRef(null);

	useEffect(() => {
		selectedUserIdRef.current = selectedUserId;
	}, [selectedUserId]);

	useEffect(() => {
		try {
			localStorage.removeItem(LEGACY_CHAT_KEY);
		} catch {}
	}, []);

	const refreshUnreadCount = useCallback(async () => {
		if (!getToken()) {
			setUnreadTotal(0);
			return;
		}
		try {
			const count = await getUnreadMessagesCountApi();
			setUnreadTotal(Math.max(0, Number(count) || 0));
		} catch {
			/* giữ số cũ nếu lỗi mạng */
		}
	}, []);

	useEffect(() => {
		refreshUnreadCount();
		if (!getToken()) return undefined;
		const timer = setInterval(refreshUnreadCount, 30000);
		const onFocus = () => refreshUnreadCount();
		window.addEventListener("focus", onFocus);
		return () => {
			clearInterval(timer);
			window.removeEventListener("focus", onFocus);
		};
	}, [refreshUnreadCount]);

	const loadConversations = useCallback(async () => {
		if (!getToken()) {
			setConversations([]);
			return;
		}
		setLoadingList(true);
		setError("");
		try {
			const rows = await getConversationsApi();
			const arr = Array.isArray(rows) ? rows : [];
			setConversations((prev) => {
				let next = arr.map(mapConversation);
				const peer = pendingPeerRef.current;
				if (peer) {
					next = mergePeerIntoConversations(next, peer);
				} else {
					const sel = selectedUserIdRef.current;
					if (sel) {
						const draft = prev.find((c) => normalizeId(c.user.id) === normalizeId(sel));
						if (draft) next = mergePeerIntoConversations(next, draft.user);
					}
				}
				return next;
			});
		} catch (e) {
			const peer = pendingPeerRef.current;
			setConversations((prev) => {
				if (peer) return mergePeerIntoConversations([], peer);
				const sel = selectedUserIdRef.current;
				if (!sel) return [];
				const draft = prev.find((c) => normalizeId(c.user.id) === normalizeId(sel));
				return draft ? mergePeerIntoConversations([], draft.user) : [];
			});
			if (e.status === 401) {
				setError("Vui lòng đăng nhập để xem tin nhắn.");
			} else {
				setError(e.message || "Không tải được danh sách tin nhắn.");
			}
		} finally {
			setLoadingList(false);
			refreshUnreadCount();
		}
	}, [refreshUnreadCount]);

	const loadThread = useCallback(async (userId) => {
		if (!userId || !getToken()) return;
		setLoadingThread(true);
		setThreadError("");
		try {
			const res = await getThreadMessagesApi(userId);
			const msgs = (res?.messages || []).map(mapMessage);
			const uid = normalizeId(userId);
			setConversations((prev) =>
				prev.map((c) =>
					normalizeId(c.user.id) === uid ? { ...c, messages: msgs, unread: 0 } : c
				)
			);
			setTimeout(() => {
				if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
			}, 0);
		} catch (e) {
			if (e.status === 403) {
				setThreadError("Chỉ có thể nhắn tin với bạn bè.");
			} else if (e.status === 401) {
				setThreadError("Vui lòng đăng nhập để nhắn tin.");
			} else {
				setThreadError(e.message || "Không tải được tin nhắn.");
			}
		} finally {
			setLoadingThread(false);
			refreshUnreadCount();
		}
	}, [refreshUnreadCount]);

	useEffect(() => {
		if (!open) return;
		loadConversations();
	}, [open, loadConversations]);

	useEffect(() => {
		if (open) return;
		refreshUnreadCount();
	}, [open, refreshUnreadCount]);

	useEffect(() => {
		function handleOpenChat(e) {
			const u = e?.detail?.user;
			if (!u?.id) return;
			const peer = {
				id: normalizeId(u.id),
				name: u.name || "Người dùng",
				avatar: u.avatar || "",
			};
			if (!getToken()) {
				setOpen(true);
				setError("Vui lòng đăng nhập để nhắn tin.");
				return;
			}
			pendingPeerRef.current = peer;
			setActivePeer(peer);
			setOpen(true);
			setSelectedUserId(peer.id);
			setThreadError("");
			setConversations((prev) => mergePeerIntoConversations(prev, peer));
		}
		window.addEventListener("gm:chat:open", handleOpenChat);
		return () => window.removeEventListener("gm:chat:open", handleOpenChat);
	}, []);

	useEffect(() => {
		function handleOpenPanel() {
			if (!getToken()) {
				setOpen(true);
				setError("Vui lòng đăng nhập để xem tin nhắn.");
				return;
			}
			setOpen(true);
			setError("");
		}
		window.addEventListener("gm:chat:open-panel", handleOpenPanel);
		return () => window.removeEventListener("gm:chat:open-panel", handleOpenPanel);
	}, []);

	useEffect(() => {
		if (!open || !selectedUserId) return;
		const uid = normalizeId(selectedUserId);
		const conv = conversations.find((c) => normalizeId(c.user.id) === uid);
		if (conv?.messages != null) return;
		loadThread(uid);
	}, [open, selectedUserId, conversations, loadThread]);

	useEffect(() => {
		if (!open) return;
		const t = setTimeout(() => inputRef.current?.focus(), 60);
		return () => clearTimeout(t);
	}, [open, selectedUserId]);

	const selectedConversation = useMemo(() => {
		if (!selectedUserId) return null;
		const uid = normalizeId(selectedUserId);
		const found = conversations.find((c) => normalizeId(c.user.id) === uid);
		if (found) return found;
		if (activePeer && normalizeId(activePeer.id) === uid) {
			return draftConversation(activePeer);
		}
		return null;
	}, [conversations, selectedUserId, activePeer]);

	const filteredConversations = useMemo(() => {
		const q = search.trim().toLowerCase();
		const sorted = conversations.slice().sort((a, b) => b.lastAt - a.lastAt);
		if (!q) return sorted;
		return sorted.filter((c) => (c.user.name || "").toLowerCase().includes(q));
	}, [conversations, search]);

	function selectConversation(userId) {
		const uid = normalizeId(userId);
		const conv = conversations.find((c) => normalizeId(c.user.id) === uid);
		if (conv?.user) {
			setActivePeer({
				id: uid,
				name: conv.user.name,
				avatar: conv.user.avatar,
			});
		}
		setSelectedUserId(uid);
		setThreadError("");
		setConversations((prev) =>
			prev.map((c) => (normalizeId(c.user.id) === uid ? { ...c, unread: 0 } : c))
		);
		if (conv?.messages == null || (conv?.unread > 0)) loadThread(uid);
		else {
			setTimeout(() => {
				if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
			}, 0);
		}
	}

	async function sendMessage() {
		const text = draft.trim();
		if (!text || !selectedConversation || sending) return;
		if (!getToken()) {
			setThreadError("Vui lòng đăng nhập để gửi tin nhắn.");
			return;
		}
		setSending(true);
		setThreadError("");
		const peerId = selectedConversation.user.id;
		const when = Date.now();
		const optimistic = {
			id: `tmp-${when}`,
			from: "me",
			text,
			at: when,
		};
		const peerIdNorm = normalizeId(peerId);
		setConversations((prev) =>
			prev.map((c) => {
				if (normalizeId(c.user.id) !== peerIdNorm) return c;
				const msgs = [...(c.messages || []), optimistic];
				return {
					...c,
					messages: msgs,
					lastAt: when,
					lastPreview: text,
					lastFromMe: true,
				};
			})
		);
		setDraft("");
		setTimeout(() => {
			listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight, behavior: "smooth" });
		}, 0);
		try {
			const res = await sendDirectMessageApi(peerId, text);
			const saved = mapMessage(res?.message || res);
			setConversations((prev) =>
				prev.map((c) => {
					if (normalizeId(c.user.id) !== peerIdNorm) return c;
					const msgs = (c.messages || []).map((m) =>
						m.id === optimistic.id ? saved : m
					);
					return { ...c, messages: msgs, lastAt: saved.at };
				})
			);
		} catch (e) {
			setConversations((prev) =>
				prev.map((c) => {
					if (normalizeId(c.user.id) !== peerIdNorm) return c;
					return {
						...c,
						messages: (c.messages || []).filter((m) => m.id !== optimistic.id),
					};
				})
			);
			setDraft(text);
			if (e.status === 403) {
				setThreadError("Chỉ có thể nhắn tin với bạn bè.");
			} else {
				setThreadError(e.message || "Gửi tin nhắn thất bại.");
			}
		} finally {
			setSending(false);
		}
	}

	function handleKeyDown(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	function handleCloseReset() {
		setOpen(false);
		setSelectedUserId(null);
		setActivePeer(null);
		pendingPeerRef.current = null;
		setThreadError("");
	}

	function handleBackdropClose() {
		setOpen(false);
	}

	function handleBubbleClick() {
		if (!getToken()) {
			setOpen(true);
			setError("Vui lòng đăng nhập để xem tin nhắn.");
			return;
		}
		setOpen(true);
	}

	const badgeLabel =
		unreadTotal > 99 ? "99+" : unreadTotal > 0 ? String(unreadTotal) : "";

	return (
		<>
			<div className={styles.bubbleWrap}>
				<button
					className={styles.bubble}
					onClick={handleBubbleClick}
					aria-label={
						unreadTotal > 0
							? `Tin nhắn, ${unreadTotal} tin chưa đọc`
							: "Tin nhắn"
					}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
					</svg>
					{unreadTotal > 0 ? (
						<span className={styles.bubbleBadge} aria-hidden="true">
							{badgeLabel}
						</span>
					) : null}
				</button>
			</div>

			{open && (
				<div className={styles.backdrop} onClick={handleBackdropClose}>
					<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
						<div className={styles.header}>
							<div className={styles.title}>Tin nhắn</div>
							<button className={styles.close} onClick={handleCloseReset} aria-label="Đóng">×</button>
						</div>
						{error && <div className={styles.chatError}>{error}</div>}
						<div className={styles.chat2col}>
							<aside className={styles.leftPane}>
								<div className={styles.searchRow}>
									<input
										className={styles.searchInput}
										placeholder="Tìm kiếm"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
									/>
								</div>
								{loadingList ? (
									<div className={styles.chatHint}>Đang tải...</div>
								) : (
									<ul className={styles.threadList}>
										{filteredConversations.length === 0 ? (
											<li className={styles.chatHint}>Chưa có cuộc trò chuyện nào.</li>
										) : (
											filteredConversations.map((c) => {
												const active = normalizeId(c.user.id) === normalizeId(selectedUserId);
												return (
													<li
														key={c.user.id}
														className={active ? styles.threadItemActive : styles.threadItem}
														onClick={() => selectConversation(c.user.id)}
													>
														{c.user.avatar ? (
															<img className={styles.threadAvatar} src={c.user.avatar} alt="" />
														) : (
															<div className={styles.threadAvatarFallback} aria-hidden="true">
																{initialsFromName(c.user.name)}
															</div>
														)}
														<div className={styles.threadMeta}>
															<div className={styles.threadTopRow}>
																<div className={styles.threadName}>{c.user.name}</div>
																<div className={styles.threadTime}>{formatTime(c.lastAt)}</div>
															</div>
															<div className={styles.threadBottomRow}>
																<div className={styles.threadPreview}>
																	{c.lastFromMe ? "Bạn: " : ""}
																	{c.lastPreview || ""}
																</div>
																{c.unread ? <span className={styles.unreadDot} /> : null}
															</div>
														</div>
													</li>
												);
											})
										)}
									</ul>
								)}
							</aside>

							<section className={styles.rightPane}>
								{selectedConversation ? (
									<>
										<div className={styles.threadHeader}>
											<div className={styles.threadHeaderLeft}>
												{selectedConversation.user.avatar ? (
													<img className={styles.threadAvatarLg} src={selectedConversation.user.avatar} alt="" />
												) : (
													<div className={styles.threadAvatarLgFallback} aria-hidden="true">
														{initialsFromName(selectedConversation.user.name)}
													</div>
												)}
												<div className={styles.threadHeaderName}>{selectedConversation.user.name}</div>
											</div>
										</div>
										{threadError && <div className={styles.chatError}>{threadError}</div>}
										<div className={styles.messagesArea} ref={listRef}>
											{loadingThread && !(selectedConversation.messages || []).length ? (
												<div className={styles.chatHint}>Đang tải tin nhắn...</div>
											) : (
												(selectedConversation.messages || []).map((m) => {
													const mine = m.from === "me";
													return (
														<div key={m.id} className={mine ? styles.msgRowMe : styles.msgRowThem}>
															{!mine &&
																(selectedConversation.user.avatar ? (
																	<img className={styles.msgAvatar} src={selectedConversation.user.avatar} alt="" />
																) : (
																	<div className={styles.msgAvatarFallback} aria-hidden="true">
																		{initialsFromName(selectedConversation.user.name)}
																	</div>
																))}
															<div className={styles.msgBubble}>
																<div className={styles.msgText}>{m.text}</div>
																<div className={styles.msgTime}>{formatTime(m.at)}</div>
															</div>
														</div>
													);
												})
											)}
										</div>
										<div className={styles.inputRow}>
											<input
												ref={inputRef}
												className={styles.input}
												placeholder="Nhập tin nhắn..."
												value={draft}
												onChange={(e) => setDraft(e.target.value)}
												onKeyDown={handleKeyDown}
												disabled={!!threadError && threadError.includes("bạn bè")}
											/>
											<button
												className={styles.send}
												onClick={sendMessage}
												disabled={!draft.trim() || sending || (!!threadError && threadError.includes("bạn bè"))}
											>
												{sending ? "..." : "Gửi"}
											</button>
										</div>
									</>
								) : (
									<div className={styles.emptyState}>Hãy chọn đoạn chat và cùng bắt đầu câu chuyện nào!</div>
								)}
							</section>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

function initialsFromName(name) {
	const safe = (name || "").trim();
	if (!safe) return "?";
	const parts = safe.split(/\s+/).filter(Boolean);
	const a = parts[0]?.[0] || "";
	const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
	return (a + b).toUpperCase() || "?";
}

function formatTime(ts) {
	try {
		const d = new Date(ts);
		const now = Date.now();
		const diff = Math.floor((now - ts) / 1000);
		if (diff < 60) return "vừa xong";
		if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
		if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
		return d.toLocaleDateString("vi-VN");
	} catch {
		return "";
	}
}
