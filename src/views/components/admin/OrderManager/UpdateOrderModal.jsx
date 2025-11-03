import { useState, useEffect } from "react";
import styles from "./UpdateOrderModal.module.css";
import { apiClient } from "../../../../services/apiClient";
import { useToast } from "../../../../context/ToastContext";

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "shipped", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function UpdateOrderModal({ isOpen, onClose, order, onSuccess }) {
  const [status, setStatus] = useState(order?.status || "pending");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (order) setStatus(order.status);
  }, [order]);

  if (!isOpen) return null;

  // Lọc các trạng thái có thể chuyển đến dựa trên trạng thái hiện tại
  const getAllowedStatuses = () => {
    const currentStatus = order?.status;
    
    // Định nghĩa các trạng thái có thể chuyển đến từ mỗi trạng thái
    const allowedTransitions = {
      pending: ['paid', 'shipped', 'cancelled'],
      paid: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['paid'], // KHÔNG bao gồm 'completed' - chỉ user mới có thể
      completed: [], // Không thể chuyển từ completed
      cancelled: [], // Không thể chuyển từ cancelled
    };

    const allowed = allowedTransitions[currentStatus] || [];
    
    // Chỉ hiển thị các trạng thái được phép + trạng thái hiện tại
    return STATUS_OPTIONS.filter(
      (option) => 
        allowed.includes(option.value) || 
        option.value === currentStatus ||
        option.value === 'cancelled' // Luôn hiển thị cancelled nếu được phép
    );
  };

  const allowedStatuses = getAllowedStatuses();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.put(`/orders/${order._id}`, { status });
      toast.success("Đã cập nhật trạng thái đơn hàng thành công!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật đơn:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Không thể cập nhật trạng thái đơn hàng";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Cập nhật đơn hàng</h2>
        {order?.status === 'delivered' && (
          <div style={{ 
            padding: '10px', 
            marginBottom: '10px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <strong>Lưu ý:</strong> Trạng thái "Hoàn tất" chỉ có thể được cập nhật khi người dùng xác nhận đã nhận hàng.
          </div>
        )}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Trạng thái</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {allowedStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
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
