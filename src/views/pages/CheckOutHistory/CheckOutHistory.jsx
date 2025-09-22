import { useEffect, useState } from "react";
import styles from "./CheckOutHistory.module.css";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import { getMyOrdersApi } from "../../../services/orderService";
import OrderDetailsModal from "../../components/oderDetails/OrderDetailsModal";

export default function CheckOutHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getMyOrdersApi();
        setOrders(data || []);
      } catch (e) {
        setError(e.message || "Không thể tải đơn hàng");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setModalOpen(false);
  };

  return (
    <div className={styles.history}>
      <Header />
      <main className={styles.history__main}>
        <h2 className={styles.history__title}>Lịch sử đơn hàng</h2>

        {loading && <p>Đang tải...</p>}
        {error && <p className={styles.history__error}>{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <p className={styles.history__empty}>Bạn chưa có đơn hàng nào</p>
        )}

        <div className={styles.history__list}>
          {orders.map((order) => (
            <div
              key={order._id}
              className={styles.history__card}
              onClick={() => handleOpenDetails(order)}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.history__header}>
                <span>
                  Mã đơn: <b>{order._id}</b>
                </span>
                <span
                  className={`${styles.history__status} ${
                    styles[`status--${order.status}`]
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className={styles.history__body}>
                <p>
                  <b>Ngày đặt:</b>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <p>
                  <b>Tổng tiền:</b> {order.total.toLocaleString()}₫
                </p>
                <p>
                  <b>Số sản phẩm:</b> {order.items.length}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />

      {/* Modal hiển thị chi tiết */}
      <OrderDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
      />
    </div>
  );
}
