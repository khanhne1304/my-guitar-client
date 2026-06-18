import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookMessenger } from "react-icons/fa";
import styles from "./ChatbotWidget.module.css";
import { chatService } from "../../../services/chatService";

const WELCOME =
	"Xin chào! Tôi là trợ lý tư vấn GuitarMaster. Bạn cần gợi ý nhạc cụ, phụ kiện hay so sánh sản phẩm? Hãy nhắn cho tôi nhé.";

const FB_MESSENGER_PAGE_ID =
	process.env.REACT_APP_MESSENGER_PAGE || "911060482093579";
const FB_MESSENGER_URL = `https://m.me/${FB_MESSENGER_PAGE_ID}`;

export default function ChatbotWidget({ showMessengerFab = false }) {
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [messages, setMessages] = useState([]);
	const listRef = useRef(null);
	const inputRef = useRef(null);
	const sessionIdRef = useRef(
		`web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
	);

	useEffect(() => {
		if (!open) return;
		const t = setTimeout(() => inputRef.current?.focus(), 80);
		return () => clearTimeout(t);
	}, [open]);

	useEffect(() => {
		if (!open || !listRef.current) return;
		listRef.current.scrollTop = listRef.current.scrollHeight;
	}, [messages, loading, open]);

	async function handleSend(e) {
		e?.preventDefault?.();
		const text = draft.trim();
		if (!text || loading) return;
		setError("");
		setDraft("");
		const userMsg = { id: `u-${Date.now()}`, role: "user", text };
		setMessages((prev) => [...prev, userMsg]);
		setLoading(true);
		try {
			const res = await chatService.ask({ message: text, sessionId: sessionIdRef.current });
			const botMsg = {
				id: `b-${Date.now()}`,
				role: "bot",
				text: res?.answer || "Xin lỗi, tôi chưa có câu trả lời phù hợp.",
				items: Array.isArray(res?.items) ? res.items.slice(0, 6) : [],
			};
			setMessages((prev) => [...prev, botMsg]);
		} catch (err) {
			setError(err?.message || "Không gọi được trợ lý. Vui lòng thử lại.");
		} finally {
			setLoading(false);
		}
	}

	function handleKeyDown(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend(e);
		}
	}

	return (
		<>
			<div
				className={
					showMessengerFab ? `${styles.bubbleWrap} ${styles.bubbleWrapStacked}` : styles.bubbleWrap
				}
			>
				{showMessengerFab ? (
					<a
						href={FB_MESSENGER_URL}
						target="_blank"
						rel="noopener noreferrer"
						className={styles.messengerFab}
						aria-label="Nhắn tin qua Facebook Messenger"
					>
						<FaFacebookMessenger className={styles.messengerIcon} aria-hidden="true" />
					</a>
				) : null}
				<button
					type="button"
					className={styles.bubble}
					onClick={() => setOpen(true)}
					aria-label="Trợ lý tư vấn sản phẩm"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
					</svg>
				</button>
			</div>

			{open && (
				<div className={styles.backdrop} onClick={() => setOpen(false)}>
					<div
						className={
							showMessengerFab
								? `${styles.modal} ${styles.modalAboveMessenger}`
								: styles.modal
						}
						onClick={(ev) => ev.stopPropagation()}
					>
						<div className={styles.header}>
							<div>
								<div className={styles.title}>Trợ lý tư vấn</div>
								<div className={styles.subtitle}>Gợi ý sản phẩm &amp; nhạc cụ</div>
							</div>
							<button
								type="button"
								className={styles.close}
								onClick={() => setOpen(false)}
								aria-label="Đóng"
							>
								×
							</button>
						</div>

						<div className={styles.messages} ref={listRef}>
							{messages.length === 0 && !loading ? (
								<div className={styles.emptyHint}>{WELCOME}</div>
							) : null}
							{messages.map((m) =>
								m.role === "user" ? (
									<div key={m.id} className={styles.msgUser}>
										{m.text}
									</div>
								) : (
									<div key={m.id} className={styles.msgBot}>
										{m.text}
										{m.items?.length > 0 ? (
											<ul className={styles.productList}>
												{m.items.map((p) => (
													<li key={p.id} className={styles.productItem}>
														<Link to={`/products/${p.slug}`} onClick={() => setOpen(false)}>
															{p.name}
														</Link>
														<div className={styles.productMeta}>
															{Number(p.price)?.toLocaleString("vi-VN")} {p.currency || "đ"}
															{p.brandName ? ` · ${p.brandName}` : ""}
														</div>
													</li>
												))}
											</ul>
										) : null}
									</div>
								)
							)}
							{loading ? <div className={styles.typing}>Đang tư vấn...</div> : null}
						</div>

						{error ? <div className={styles.error}>{error}</div> : null}

						<form className={styles.inputRow} onSubmit={handleSend}>
							<input
								ref={inputRef}
								className={styles.input}
								placeholder="Bạn cần guitar, phụ kiện gì?"
								value={draft}
								onChange={(e) => setDraft(e.target.value)}
								onKeyDown={handleKeyDown}
								disabled={loading}
							/>
							<button className={styles.send} type="submit" disabled={loading || !draft.trim()}>
								Gửi
							</button>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
