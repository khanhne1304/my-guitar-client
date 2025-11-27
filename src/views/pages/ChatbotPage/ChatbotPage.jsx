import { useState } from "react";
import { chatService } from "../../../services/chatService";
import styles from "./ChatbotPage.module.css";
import { Link } from "react-router-dom";

export default function ChatbotPage() {
	const [message, setMessage] = useState("");
	const [answer, setAnswer] = useState("");
	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState([]);
	const [error, setError] = useState("");

	async function handleAsk(e) {
		e?.preventDefault?.();
		setError("");
		setAnswer("");
		setItems([]);
		try {
			setLoading(true);
			const res = await chatService.ask({ message });
			setAnswer(res?.answer || "");
			setItems(Array.isArray(res?.items) ? res.items : []);
		} catch (err) {
			console.error(err);
			setError(err.message || "Lỗi gọi chatbot");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className={styles.container}>
			<h1>Trợ lý tư vấn sản phẩm (RAG)</h1>
			<form className={styles.form} onSubmit={handleAsk}>
				<input
					className={styles.input}
					type="text"
					placeholder="Bạn cần nhạc cụ gì? (VD: guitar tầm 3 triệu)"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<button className={styles.button} type="submit" disabled={loading || !message.trim()}>
					{loading ? "Đang tư vấn..." : "Hỏi trợ lý"}
				</button>
			</form>

			{error && <div className={styles.error}>{error}</div>}

			{answer && (
				<div className={styles.answer}>
					<h3>Kết quả</h3>
					<p>{answer}</p>
				</div>
			)}

			{items?.length > 0 && (
				<div className={styles.results}>
					<h3>Sản phẩm gợi ý</h3>
					<ul className={styles.list}>
						{items.slice(0, 6).map((p) => (
							<li key={p.id} className={styles.item}>
								<div className={styles.productInfo}>
									<div className={styles.productName}>
										<Link to={`/products/${p.slug}`}>{p.name}</Link>
									</div>
									<div className={styles.productMeta}>
										Giá: {Number(p.price)?.toLocaleString("vi-VN")} {p.currency}
										{p.brandName ? ` • ${p.brandName}` : ""} {p.categoryName ? ` • ${p.categoryName}` : ""}
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}


