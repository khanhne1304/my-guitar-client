import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import styles from "./OrderDetailsModal.module.css";
import ReviewModal from "../review/ReviewModal";
import { getReviewsApi } from "../../../services/reviewService";
import { useAuth } from "../../../context/AuthContext";
import { getUser } from "../../../utils/storage";
import { confirmReceivedApi, cancelOrderApi } from "../../../services/orderService";
import { useToast } from "../../../context/ToastContext";
import { useConfirm } from "../../../context/ConfirmContext";

export default function OrderDetailsModal({ open, onClose, order, onReviewSuccess }) {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReviews, setProductReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { user: authUser } = useAuth();
  const currentUser = authUser || getUser();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (open && order && order.status === 'completed') {
      loadProductReviews();
    }
  }, [open, order]);

  const loadProductReviews = async () => {
    if (!order?.items?.length || !currentUser?._id) return;
    
    setLoadingReviews(true);
    try {
      const reviewsMap = {};
      const currentUserId = currentUser._id;
      
      for (const item of order.items) {
        const productId = item.product?._id || item.product;
        if (productId) {
          const reviews = await getReviewsApi(productId);
          // Lấy review của user hiện tại
          const userReview = reviews.find((r) => {
            const reviewUserId = r.user?._id || r.user;
            return reviewUserId === currentUserId || reviewUserId?.toString() === currentUserId?.toString();
          });
          if (userReview) {
            reviewsMap[productId] = userReview;
          }
        }
      }
      setProductReviews(reviewsMap);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (!open || !order) return null;

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

  const statusClass = {
    pending: styles.statusPending,
    paid: styles.statusPaid,
    shipped: styles.statusShipped,
    delivered: styles.statusDelivered,
    completed: styles.statusCompleted,
    cancelled: styles.statusCancelled,
  }[order.status] || styles.statusPending;

  const handleReviewClick = (item) => {
    const productId = item.product?._id || item.product;
    setSelectedProduct({
      product: {
        _id: productId,
        name: item.name,
      },
      name: item.name,
      _id: productId,
    });
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    loadProductReviews();
    if (onReviewSuccess) {
      onReviewSuccess();
    }
  };

  const hasReviewed = (item) => {
    const productId = item.product?._id || item.product;
    return productId && productReviews[productId];
  };

  const handleConfirmReceived = async () => {
    if (!order || order.status !== 'delivered') return;
    
    const confirmed = await confirm.confirm('Bạn có chắc chắn đã nhận được hàng?');
    if (!confirmed) {
      return;
    }

    try {
      setConfirming(true);
      await confirmReceivedApi(order._id);
      toast.success('Đã xác nhận nhận hàng thành công!');
      if (onReviewSuccess) {
        onReviewSuccess(); // Refresh danh sách đơn hàng
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Không thể xác nhận nhận hàng');
    } finally {
      setConfirming(false);
    }
  };

  const canConfirmReceived = order?.status === 'delivered';
  const canCancel = ['pending', 'paid', 'shipped'].includes(order?.status);

  const handleCancelOrder = async () => {
    if (!order || !canCancel) return;

    // Lý do hủy (chọn nhanh hoặc nhập tay)
    const reasons = [
      'Đặt nhầm sản phẩm',
      'Đổi ý không mua nữa',
      'Thời gian giao lâu',
      'Muốn đổi phương thức thanh toán',
      'Khác...'
    ];

    // Hộp chọn lý do đơn giản: dùng prompt nhiều bước (tối giản, không dùng alert)
    // Gợi ý: có thể nâng cấp thành modal riêng nếu cần UI đẹp hơn
    const choice = window.prompt(
      `Chọn lý do (1-${reasons.length}) hoặc nhập lý do chi tiết:\n` +
      reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')
    );
    if (!choice) return;

    let reason = choice;
    const index = Number(choice);
    if (!Number.isNaN(index) && index >= 1 && index <= reasons.length) {
      reason = reasons[index - 1];
    }

    const ok = await confirm.confirm('Bạn chắc chắn muốn hủy đơn hàng này?');
    if (!ok) return;

    try {
      await cancelOrderApi(order._id, reason);
      toast.success('Đã hủy đơn hàng thành công');
      if (onReviewSuccess) onReviewSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Không thể hủy đơn hàng');
    }
  };

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
            {getStatusLabel(order.status)}
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
              {order.items.map((it, i) => {
                const productId = it.product?._id || it.product;
                const reviewed = hasReviewed(it);
                const canReview = order.status === 'completed' && productId;
                
                return (
                  <li key={i} className={styles.item}>
                    <div className={styles.itemContent}>
                      <span>
                        {it.name} × {it.qty} ({it.price.toLocaleString()}₫)
                      </span>
                      {canReview && (
                        <button
                          className={`${styles.reviewBtn} ${reviewed ? styles.reviewed : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewClick(it);
                          }}
                          disabled={loadingReviews}
                        >
                          {reviewed ? '✓ Đã đánh giá' : 'Đánh giá'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className={styles.total}>Tổng tiền: {order.total.toLocaleString()}₫</p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          {canCancel && (
            <button
              className={styles.cancelOrderBtn}
              onClick={handleCancelOrder}
            >
              Hủy đơn hàng
            </button>
          )}
          {canConfirmReceived && (
            <button
              className={styles.confirmBtn}
              onClick={handleConfirmReceived}
              disabled={confirming}
            >
              {confirming ? 'Đang xác nhận...' : '✓ Đã nhận được hàng'}
            </button>
          )}
          <button className={styles.closeFooterBtn} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        open={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
