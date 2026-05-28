import { useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./MessengerPage.module.css";

/** Trang tin nhắn nội bộ — tự mở panel chat bạn bè */
export default function MessengerPage() {
	useEffect(() => {
		const t = setTimeout(() => {
			window.dispatchEvent(new CustomEvent("gm:chat:open-panel"));
		}, 120);
		return () => clearTimeout(t);
	}, []);

	return (
		<div className={styles.page}>
			<h1 className={styles.title}>Tin nhắn</h1>
			<p className={styles.hint}>
				Cửa sổ chat đã mở ở góc dưới bên phải. Chọn bạn bè để bắt đầu trò chuyện hoặc xem{" "}
				<Link to="/friends">danh sách bạn bè</Link>.
			</p>
		</div>
	);
}
