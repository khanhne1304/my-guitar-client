import styles from "./OrderDetailsModal.module.css";

export default function OrderDetailsModal({ isOpen, onClose, order, onEdit }) {
	if (!isOpen || !order) return null;

	const shipping = order.shippingAddress || {};
	const items = Array.isArray(order.items) ? order.items : [];

	const formatMoney = (n) =>
		typeof n === "number" ? `${n.toLocaleString("vi-VN")}₫` : "-";

	const statusMap = {
		pending: { label: "Chờ xử lý", cls: styles.pending },
		paid: { label: "Đã thanh toán", cls: styles.paid },
		shipped: { label: "Đang giao", cls: styles.shipped },
		delivered: { label: "Đã giao", cls: styles.delivered },
		completed: { label: "Hoàn tất", cls: styles.completed },
		cancelled: { label: "Đã hủy", cls: styles.cancelled },
	};
	const statusMeta = statusMap[order.status] || { label: order.status, cls: "" };

	return (
		<div className={styles.backdrop} onClick={onClose}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<div className={styles.header}>
					<h2>Chi tiết đơn hàng</h2>
					<button className={styles.closeBtn} onClick={onClose}>
						×
					</button>
				</div>

				<div className={styles.section}>
					<div className={styles.row}>
						<div>
							<div className={styles.label}>Mã đơn</div>
							<div className={styles.value}>{order._id}</div>
						</div>
						<div>
							<div className={styles.label}>Trạng thái</div>
							<div className={`${styles.badge} ${statusMeta.cls}`}>{statusMeta.label}</div>
						</div>
						<div>
							<div className={styles.label}>Tổng tiền</div>
							<div className={styles.total}>{formatMoney(order.total)}</div>
						</div>
					</div>
					<div className={styles.row}>
						<div>
							<div className={styles.label}>Ngày tạo</div>
							<div className={styles.value}>
								{new Date(order.createdAt).toLocaleString("vi-VN")}
							</div>
						</div>
						<div>
							<div className={styles.label}>Thanh toán</div>
							<div className={styles.value}>
								{order.paidAt
									? new Date(order.paidAt).toLocaleString("vi-VN")
									: "Chưa thanh toán"}
							</div>
						</div>
						<div>
							<div className={styles.label}>Phương thức</div>
							<div className={styles.value}>{order.paymentMethod?.toUpperCase?.() || "-"}</div>
						</div>
					</div>
				</div>

				<div className={styles.section}>
					<h3 className={styles.subTitle}>Người mua</h3>
					<div className={styles.row}>
						<div>
							<div className={styles.label}>Tài khoản</div>
							<div className={styles.value}>{order.user?.username || "Ẩn danh"}</div>
						</div>
						<div>
							<div className={styles.label}>Email</div>
							<div className={styles.value}>{order.user?.email || "-"}</div>
						</div>
					</div>
				</div>

				<div className={styles.section}>
					<h3 className={styles.subTitle}>Địa chỉ giao hàng</h3>
					<div className={styles.row}>
						<div>
							<div className={styles.label}>Họ tên</div>
							<div className={styles.value}>{shipping.fullName || "-"}</div>
						</div>
						<div>
							<div className={styles.label}>Số điện thoại</div>
							<div className={styles.value}>{shipping.phone || "-"}</div>
						</div>
					</div>
					<div className={styles.row}>
						<div className={styles.colFull}>
							<div className={styles.label}>Địa chỉ</div>
							<div className={styles.value}>
								{[shipping.address, shipping.district, shipping.city].filter(Boolean).join(", ") || "-"}
							</div>
						</div>
					</div>
				</div>

				<div className={styles.section}>
					<h3 className={styles.subTitle}>Sản phẩm</h3>
					<table className={styles.table}>
						<thead>
							<tr>
								<th>Tên</th>
								<th>Số lượng</th>
								<th>Đơn giá</th>
								<th>Tạm tính</th>
							</tr>
						</thead>
						<tbody>
							{items.map((it, idx) => (
								<tr key={idx}>
									<td>{it.name}</td>
									<td>{it.qty}</td>
									<td>{formatMoney(it.price)}</td>
									<td>{formatMoney((it.price || 0) * (it.qty || 0))}</td>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr>
								<td colSpan={3} className={styles.right}>
									Tổng cộng
								</td>
								<td className={styles.total}>{formatMoney(order.total)}</td>
							</tr>
						</tfoot>
					</table>
				</div>

				<div className={styles.actions}>
					<button className={styles.secondaryBtn} onClick={onClose}>
						Đóng
					</button>
					<button className={styles.primaryBtn} onClick={() => onEdit(order)}>
						Cập nhật trạng thái
					</button>
				</div>
			</div>
		</div>
	);
}

