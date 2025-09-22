import { FaTimes } from "react-icons/fa";
import styles from "./OrderDetailsModal.module.css";

export default function OrderDetailsModal({ open, onClose, order }) {
  if (!open || !order) return null;

  const statusClass = {
    pending: styles.statusPending,
    paid: styles.statusPaid,
    shipped: styles.statusShipped,
    completed: styles.statusCompleted,
    cancelled: styles.statusCancelled,
  }[order.status] || styles.statusPending;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // tránh đóng modal khi click bên trong
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3>Chi tiết đơn hàng</h3>
          <span className={`${styles.statusBadge} ${statusClass}`}>
            {order.status}
          </span>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Nội dung */}
        <div className={styles.modalBody}>
          <div className={styles.section}>
            <p><b>Mã đơn:</b> {order._id}</p>
            <p><b>Ngày đặt:</b> {new Date(order.createdAt).toLocaleString()}</p>
            <p><b>Phương thức thanh toán:</b> {order.paymentMethod}</p>
          </div>

          {order.shippingAddress && (
            <div className={styles.section}>
              <h4>Thông tin giao hàng</h4>
              <p><b>Tên:</b> {order.shippingAddress.fullName}</p>
              <p><b>SĐT:</b> {order.shippingAddress.phone}</p>
              <p>
                <b>Địa chỉ:</b> {order.shippingAddress.address},{" "}
                {order.shippingAddress.district}, {order.shippingAddress.city}
              </p>
            </div>
          )}

          <div className={styles.section}>
            <h4>Sản phẩm</h4>
            <ul className={styles.itemList}>
              {order.items.map((it, i) => (
                <li key={i} className={styles.item}>
                  {it.name} × {it.qty} ({it.price.toLocaleString()}₫)
                </li>
              ))}
            </ul>
            <p className={styles.total}>Tổng tiền: {order.total.toLocaleString()}₫</p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.closeFooterBtn} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
