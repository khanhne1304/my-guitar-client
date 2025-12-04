import { useEffect, useRef, useState } from "react";
import styles from "./ChatWidget.module.css";
import { chatService } from "../../../services/chatService";
import { Link } from "react-router-dom";

export default function ChatWidget() {
	const FACEBOOK_URL = process.env.REACT_APP_FACEBOOK_URL || "https://www.facebook.com/phan.le.chi.khanh";
	const ZALO_URL = process.env.REACT_APP_ZALO_URL || " https://zalo.me/0901801325";
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]); // [{ role: 'user'|'assistant', content: string, items?: [] }]
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [copiedIdx, setCopiedIdx] = useState(null);
	const inputRef = useRef(null);
	const listRef = useRef(null);

	function copyTextToClipboard(text) {
		try {
			if (navigator?.clipboard?.writeText) {
				navigator.clipboard.writeText(text);
				return;
			}
		} catch {}
		const ta = document.createElement('textarea');
		ta.value = text;
		ta.style.position = 'fixed';
		ta.style.opacity = '0';
		document.body.appendChild(ta);
		ta.select();
		try {
			document.execCommand('copy');
		} finally {
			document.body.removeChild(ta);
		}
	}

	function editQuestion(content, idxToEdit) {
		// Xoá toàn bộ đoạn hội thoại từ tin đang chỉnh sửa trở xuống
		setMessages((prev) => prev.slice(0, Math.max(0, idxToEdit)));
		setMessage(content || "");
		setLoading(false);
		setError("");
		setCopiedIdx(null);
		setTimeout(() => {
			try {
				inputRef.current?.focus();
				// Đưa caret về cuối
				const el = inputRef.current;
				el?.setSelectionRange?.(el.value.length, el.value.length);
			} catch {}
		}, 0);
	}

	useEffect(() => {
		if (open) {
			setTimeout(() => inputRef.current?.focus(), 50);
			// Chào mừng lần đầu mở
			setMessages((prev) => {
				if (prev.length) return prev;
				return [
					{
						role: "assistant",
						content: "Xin chào! Tôi có thể giúp gì cho bạn?",
					},
				];
			});
		}
	}, [open]);

	useEffect(() => {
		// Auto scroll to bottom khi có tin mới
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [messages, loading]);

	async function send() {
		if (!message.trim()) return;
		setError("");
		const userTurn = { role: "user", content: message };
		setMessages((prev) => [...prev, userTurn]);
		try {
			setLoading(true);
			const res = await chatService.ask({ message });
			const assistantTurn = {
				role: "assistant",
				content: res?.answer || "Mình tạm thời chưa có câu trả lời.",
				items: Array.isArray(res?.items) ? res.items : [],
			};
			setMessages((prev) => [...prev, assistantTurn]);
			setMessage("");
		} catch (e) {
			setError(e?.message || "Lỗi chatbot");
		} finally {
			setLoading(false);
		}
	}

	function handleKeyDown(e) {
		// Enter để gửi, Shift+Enter để xuống dòng (nếu sau này dùng <textarea>)
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			send();
			return;
		}
		if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
			send();
		}
	}

	return (
		<>
			{/* Social floating buttons */}
			<a
				className={`${styles.socialFab} ${styles.fb}`}
				href={FACEBOOK_URL}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Facebook"
				title="Facebook"
			>
				{/* 'f' icon */}
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
					<path d="M22.675 0h-21.35C.595 0 0 .594 0 1.326v21.348C0 23.406.595 24 1.326 24h11.495v-9.294H9.691V11.01h3.13V8.414c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.765v2.314h3.59l-.467 3.696h-3.123V24h6.127C23.406 24 24 23.406 24 22.674V1.326C24 .594 23.406 0 22.675 0z"/>
				</svg>
			</a>
			<a
				className={`${styles.socialFab} ${styles.zalo}`}
				href={ZALO_URL}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Zalo"
				title="Zalo"
			>
				{/* simple Z letter */}
				<span className={styles.zaloIcon}>Z</span>
			</a>

			<button className={styles.bubble} onClick={() => setOpen(true)} aria-label="Chatbot">
				{/* simple chat icon */}
				<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
				</svg>
			</button>

			{open && (
				<div className={styles.backdrop} onClick={() => setOpen(false)}>
					<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
						<div className={styles.header}>
							<div className={styles.title}>Trợ lý tư vấn sản phẩm</div>
							<button className={styles.close} onClick={() => setOpen(false)} aria-label="Đóng">×</button>
						</div>
						<div className={styles.body}>
							{copiedIdx !== null && (
								<div className={styles.copiedCenter}>Đã copy</div>
							)}
							<div className={styles.chatArea} ref={listRef}>
								{messages.map((m, idx) => {
									const isUser = m.role === "user";
									return (
										<div key={idx} className={isUser ? styles.bubbleUser : styles.bubbleBot}>
											{isUser && (
												<button
													type="button"
													className={styles.copyBtn}
													title="Sao chép câu hỏi"
													aria-label="Sao chép câu hỏi"
													onClick={() => {
														copyTextToClipboard(m.content);
														setCopiedIdx(idx);
														setTimeout(() => setCopiedIdx(null), 1500);
													}}
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
														<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
														<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
													</svg>
												</button>
											)}
											{isUser && (
												<button
													type="button"
													className={styles.editBtn}
													title="Chỉnh sửa câu hỏi"
													aria-label="Chỉnh sửa câu hỏi"
													onClick={() => editQuestion(m.content, idx)}
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
														<path d="M12 20h9"></path>
														<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
													</svg>
												</button>
											)}
											<div className={styles.msgText}>{m.content}</div>
											{!isUser && Array.isArray(m.items) && m.items.length > 0 && (
												<ul className={styles.items}>
													{m.items.slice(0, 6).map((p) => (
														<li key={p.id} className={styles.item}>
															<div className={styles.itemName}>
																<Link to={`/products/${p.slug}`} onClick={() => setOpen(false)}>
																	{p.name}
																</Link>
															</div>
															<div className={styles.itemMeta}>
																{Number(p.price)?.toLocaleString("vi-VN")} {p.currency}
																{p.brandName ? ` • ${p.brandName}` : ""} {p.categoryName ? ` • ${p.categoryName}` : ""}
															</div>
														</li>
													))}
												</ul>
											)}
										</div>
									);
								})}
								{loading && (
									<div className={styles.bubbleBot}>
										<div className={styles.typing}>
											<span></span><span></span><span></span>
										</div>
									</div>
								)}
							</div>
							<div className={styles.formRow}>
								<input
									ref={inputRef}
									className={styles.input}
									placeholder="Câu hỏi của bạn..."
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									onKeyDown={handleKeyDown}
								/>
								<button className={styles.send} onClick={send} disabled={!message.trim() || loading}>
									{loading ? "Đang tư vấn..." : "Gửi"}
                                </button>
							</div>

							{error && <div className={styles.error}>{error}</div>}
						</div>
					</div>
				</div>
			)}
		</>
	);
}


