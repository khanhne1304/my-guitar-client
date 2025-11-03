import { useEffect, useState } from "react";
import { adminListOrdersApi } from "../../../../services/orderService";
import styles from "./OrderManager.module.css";
import UpdateOrderModal from "./UpdateOrderModal";
export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOrder, setEditOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminListOrdersApi();
      setOrders(data);
    } catch (err) {
      console.error("Lỗi khi load đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  const handleEdit = (o) => {
    setEditOrder(o);
    setShowEditModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý đơn hàng</h1>
      </div>

      {loading ? (
        <p className={styles.loading}>Đang tải...</p>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>Chưa có đơn hàng nào.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Người mua</th>
              <th>Số sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thanh toán</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o._id.slice(-6).toUpperCase()}</td>
                <td>
                  {o.user?.username || "Ẩn danh"}
                  <br />
                  <span className={styles.userEmail}>{o.user?.email}</span>
                </td>
                <td>{o.items?.length ?? 0}</td>
                <td className={styles.total}>
                  {o.total?.toLocaleString("vi-VN")}₫
                </td>
                <td
                  className={
                    o.status === "pending"
                      ? styles.pending
                      : o.status === "paid"
                        ? styles.paid
                        : o.status === "shipped"
                          ? styles.shipped
                          : o.status === "delivered"
                            ? styles.delivered
                            : o.status === "completed"
                              ? styles.completed
                              : styles.cancelled
                  }
                >
                  {(() => {
                    const labels = {
                      pending: 'Chờ xử lý',
                      paid: 'Đã thanh toán',
                      shipped: 'Đang giao',
                      delivered: 'Đã giao',
                      completed: 'Hoàn tất',
                      cancelled: 'Đã hủy',
                    };
                    return labels[o.status] || o.status;
                  })()}
                </td>
                <td>{new Date(o.createdAt).toLocaleString("vi-VN")}</td>
                <td>
                  {o.paidAt
                    ? new Date(o.paidAt).toLocaleString("vi-VN")
                    : "Chưa thanh toán"}
                </td>
                <td>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEdit(o)}
                  >
                    Chỉnh sửa
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showEditModal && (
        <UpdateOrderModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          order={editOrder}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
}
