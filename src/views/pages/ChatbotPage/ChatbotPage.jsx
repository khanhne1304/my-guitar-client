import { useRef, useState } from "react";
import { chatService } from "../../../services/chatService";
import styles from "./ChatbotPage.module.css";
import { Link } from "react-router-dom";

const WELCOME =
	"Xin chào! Tôi là trợ lý tư vấn GuitarMaster (RAG + DeepSeek). Hỏi về sản phẩm, khóa học guitar hoặc chính sách cửa hàng nhé.";

export default function ChatbotPage() {
	const [draft, setDraft] = useState("");
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState([]);
	const [error, setError] = useState("");
	const sessionIdRef = useRef(
		`page-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
	);
	const listRef = useRef(null);

	async function handleAsk(e) {
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
			setTimeout(() => {
				if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
			}, 50);
		} catch (err) {
			console.error(err);
			setError(err.message || "Lỗi gọi chatbot");
		} finally {
			setLoading(false);
		}
	}

	async function handleClear() {
		await chatService.clearSession(sessionIdRef.current);
		sessionIdRef.current = `page-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
		setMessages([]);
		setError("");
	}

	return (
		<div className={styles.container}>
			<div className={styles.headerRow}>
				<h1>Trợ lý tư vấn (RAG + DeepSeek)</h1>
				<button type="button" className={styles.clearBtn} onClick={handleClear}>
					Xóa hội thoại
				</button>
			</div>

			<div className={styles.chatBox} ref={listRef}>
				{messages.length === 0 && !loading ? (
					<div className={styles.welcome}>{WELCOME}</div>
				) : null}
				{messages.map((m) =>
					m.role === "user" ? (
						<div key={m.id} className={styles.msgUser}>
							{m.text}
						</div>
					) : (
						<div key={m.id} className={styles.msgBot}>
							<p>{m.text}</p>
							{m.items?.length > 0 ? (
								<ul className={styles.list}>
									{m.items.map((p) => (
										<li key={p.id} className={styles.item}>
											<Link to={`/products/${p.slug}`}>{p.name}</Link>
											<span className={styles.productMeta}>
												{Number(p.price)?.toLocaleString("vi-VN")} {p.currency || "đ"}
												{p.brandName ? ` · ${p.brandName}` : ""}
											</span>
										</li>
									))}
								</ul>
							) : null}
						</div>
					),
				)}
				{loading ? <div className={styles.typing}>Đang tư vấn...</div> : null}
			</div>

			{error && <div className={styles.error}>{error}</div>}

			<form className={styles.form} onSubmit={handleAsk}>
				<input
					className={styles.input}
					type="text"
					placeholder="VD: guitar tầm 3 triệu, khóa học cơ bản..."
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					disabled={loading}
				/>
				<button className={styles.button} type="submit" disabled={loading || !draft.trim()}>
					{loading ? "Đang tư vấn..." : "Gửi"}
				</button>
			</form>
		</div>
	);
}
