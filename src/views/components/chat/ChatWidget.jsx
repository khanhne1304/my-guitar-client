import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ChatWidget.module.css";

export default function ChatWidget() {
	const [open, setOpen] = useState(false);

	// Two-pane user chat state
	const [conversations, setConversations] = useState(() => {
		try {
			const raw = localStorage.getItem("gm.chat.conversations");
			if (raw) return JSON.parse(raw);
		} catch {}
		return [];
	});
	const [selectedUserId, setSelectedUserId] = useState(null);
	const [draft, setDraft] = useState("");

	const inputRef = useRef(null);
	const listRef = useRef(null);

	useEffect(() => {
		try {
			localStorage.setItem("gm.chat.conversations", JSON.stringify(conversations));
		} catch {}
	}, [conversations]);

	useEffect(() => {
		function handleOpenChat(e) {
			const u = e?.detail?.user;
			if (!u?.id) return;
			setOpen(true);
			setConversations((prev) => {
				const exists = prev.some((c) => c.user?.id === u.id);
				if (exists) return prev;
				const now = Date.now();
				return [
					{
						user: { id: u.id, name: u.name || "Người dùng", avatar: u.avatar || "" },
						lastAt: now,
						messages: [],
						unread: 0,
					},
					...prev,
				];
			});
			setSelectedUserId(u.id);
		}
		window.addEventListener("gm:chat:open", handleOpenChat);
		return () => window.removeEventListener("gm:chat:open", handleOpenChat);
	}, []);

	useEffect(() => {
		if (!open) return;
		// focus input when modal opens (if a thread is picked)
		const t = setTimeout(() => inputRef.current?.focus(), 60);
		return () => clearTimeout(t);
	}, [open]);

	const selectedConversation = useMemo(
		() => conversations.find((c) => c.user.id === selectedUserId) || null,
		[conversations, selectedUserId]
	);

	function selectConversation(userId) {
		setSelectedUserId(userId);
		// mark as read
		setConversations((prev) =>
			prev.map((c) => (c.user.id === userId ? { ...c, unread: 0 } : c))
		);
		// scroll to bottom after render
		setTimeout(() => {
			if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
		}, 0);
	}

	function sendMessage() {
		const text = draft.trim();
		if (!text || !selectedConversation) return;
		const when = Date.now();
		setConversations((prev) =>
			prev.map((c) => {
				if (c.user.id !== selectedConversation.user.id) return c;
				const msg = { id: `m${when}`, from: "me", text, at: when };
				return { ...c, messages: [...c.messages, msg], lastAt: when };
			})
		);
		setDraft("");
		setTimeout(() => {
			listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight, behavior: "smooth" });
		}, 0);
	}

	function handleKeyDown(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}
	function handleCloseReset() {
		// Close and reset selection (used by the X button)
		setOpen(false);
		setSelectedUserId(null);
	}
	function handleBackdropClose() {
		// Close but KEEP current selection to restore next open
		setOpen(false);
	}

	return (
		<>
			<button className={styles.bubble} onClick={() => setOpen(true)} aria-label="Chatbot">
				{/* simple chat icon */}
				<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
				</svg>
			</button>

			{open && (
				<div className={styles.backdrop} onClick={handleBackdropClose}>
					<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
						<div className={styles.header}>
							<div className={styles.title}>Tin nhắn</div>
							<button className={styles.close} onClick={handleCloseReset} aria-label="Đóng">×</button>
						</div>
						<div className={styles.chat2col}>
							{/* Left: conversation list */}
							<aside className={styles.leftPane}>
								<div className={styles.searchRow}>
									<input className={styles.searchInput} placeholder="Tìm kiếm" />
								</div>
								<ul className={styles.threadList}>
									{conversations
										.slice()
										.sort((a, b) => b.lastAt - a.lastAt)
										.map((c) => {
											const active = c.user.id === selectedUserId;
											const lastMsg = c.messages[c.messages.length - 1];
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
																{lastMsg?.from === "me" ? "Bạn: " : ""}
																{lastMsg?.text || ""}
															</div>
															{c.unread ? <span className={styles.unreadDot} /> : null}
														</div>
													</div>
												</li>
											);
										})}
								</ul>
							</aside>

							{/* Right: messages */}
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
										<div className={styles.messagesArea} ref={listRef}>
											{selectedConversation.messages.map((m) => {
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
											})}
										</div>
										<div className={styles.inputRow}>
											<input
												ref={inputRef}
												className={styles.input}
												placeholder="Nhập tin nhắn..."
												value={draft}
												onChange={(e) => setDraft(e.target.value)}
												onKeyDown={handleKeyDown}
											/>
											<button className={styles.send} onClick={sendMessage} disabled={!draft.trim()}>
												Gửi
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


