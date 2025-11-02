import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import styles from "./OrderDetailsModal.module.css";
import ReviewModal from "../review/ReviewModal";
import { getReviewsApi } from "../../../services/reviewService";
import { useAuth } from "../../../context/AuthContext";
import { getUser } from "../../../utils/storage";

export default function OrderDetailsModal({ open, onClose, order, onReviewSuccess }) {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReviews, setProductReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(false);
  const { user: authUser } = useAuth();
  const currentUser = authUser || getUser();

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

  const statusClass = {
    pending: styles.statusPending,
    paid: styles.statusPaid,
    shipped: styles.statusShipped,
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
