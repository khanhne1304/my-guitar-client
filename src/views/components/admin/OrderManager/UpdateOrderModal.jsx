import { useState, useEffect } from "react";
import styles from "./UpdateOrderModal.module.css";
import { apiClient } from "../../../../services/apiClient";

const STATUS_OPTIONS = [
  "pending",
  "paid",
  "shipped",
  "completed",
  "cancelled",
];

export default function UpdateOrderModal({ isOpen, onClose, order, onSuccess }) {
  const [status, setStatus] = useState(order?.status || "pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (order) setStatus(order.status);
  }, [order]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await apiClient.put(`/orders/${order._id}`, { status });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật đơn:", err);
      setError(err?.message || "Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Cập nhật đơn hàng</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}
          <div className={styles.field}>
            <label>Trạng thái</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
