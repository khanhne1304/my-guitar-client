import { useEffect, useState } from "react";
import styles from "./CheckOutHistory.module.css";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import { getMyOrdersApi, confirmReceivedApi } from "../../../services/orderService";
import OrderDetailsModal from "../../components/oderDetails/OrderDetailsModal";
import { useToast } from "../../../context/ToastContext";
import { useConfirm } from "../../../context/ConfirmContext";

export default function CheckOutHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();

  async function fetchOrders() {
    try {
      setLoading(true);
      const data = await getMyOrdersApi();
      setOrders(data || []);
      setError("");
    } catch (e) {
      setError(e.message || "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
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

  const handleConfirmReceived = async (order, e) => {
    e.stopPropagation(); // Ngăn mở modal khi click nút
    if (!order || order.status !== 'delivered') return;
    
    const confirmed = await confirm.confirm('Bạn có chắc chắn đã nhận được hàng?');
    if (!confirmed) {
      return;
    }

    try {
      setConfirmingOrderId(order._id);
      await confirmReceivedApi(order._id);
      toast.success('Đã xác nhận nhận hàng thành công!');
      fetchOrders(); // Refresh danh sách đơn hàng
    } catch (err) {
      toast.error(err.message || 'Không thể xác nhận nhận hàng');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xử lý',
      paid: 'Đã thanh toán',
      shipped: 'Đang giao',
      delivered: 'Đã giao',
      completed: 'Hoàn tất',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
  };

  const normalized = (s) => (s || "").toString().toLowerCase().trim();
  const filteredOrders = orders.filter((order) => {
    const q = normalized(query);
    const matchQuery = !q
      || normalized(order._id).includes(q)
      || normalized(order.status).includes(q)
      || normalized(order.paymentMethod).includes(q)
      || normalized(order?.shippingAddress?.fullName).includes(q)
      || normalized(order?.shippingAddress?.phone).includes(q)
      || (order.items || []).some((it) => normalized(it.name).includes(q));

    const matchStatus = !status || order.status === status;
    return matchQuery && matchStatus;
  });

  return (
    <div className={styles.history}>
      <Header />
      <main className={styles.history__main}>
        <h2 className={styles.history__title}>Lịch sử đơn hàng</h2>

        {/* Toolbar: search + filters */}
        <div className={styles.history__toolbar}>
          <input
            className={styles.history__search}
            placeholder="Tìm kiếm theo mã đơn, tên sp, khách, SĐT, trạng thái..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className={styles.history__select}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="paid">Đã thanh toán</option>
            <option value="shipped">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="completed">Hoàn tất</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {loading && <p>Đang tải...</p>}
        {error && <p className={styles.history__error}>{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <p className={styles.history__empty}>Bạn chưa có đơn hàng nào</p>
        )}

        <div className={styles.history__list}>
          {filteredOrders.map((order) => (
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
                  {getStatusLabel(order.status)}
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
                <p>
                  <b>Thanh toán:</b> {order.paymentMethod}
                </p>
                {order?.shippingAddress && (
                  <p>
                    <b>Người nhận:</b> {order.shippingAddress.fullName} — {order.shippingAddress.phone}
                  </p>
                )}
                {order.items?.length > 0 && (
                  <p className={styles.history__itemsPreview}>
                    <b>Sản phẩm:</b> {order.items.slice(0, 2).map((it) => it.name).join(', ')}
                    {order.items.length > 2 ? ` và ${order.items.length - 2} sp khác` : ''}
                  </p>
                )}
              </div>
              {order.status === 'delivered' && (
                <div className={styles.history__actions}>
                  <button
                    className={styles.confirmReceivedBtn}
                    onClick={(e) => handleConfirmReceived(order, e)}
                    disabled={confirmingOrderId === order._id}
                  >
                    {confirmingOrderId === order._id ? 'Đang xác nhận...' : '✓ Đã nhận được hàng'}
                  </button>
                </div>
              )}
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
        onReviewSuccess={fetchOrders}
      />
    </div>
  );
}
