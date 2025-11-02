import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import StarRating from "../rating/StarRating";
import { createReviewApi } from "../../../services/reviewService";
import styles from "./ReviewModal.module.css";

export default function ReviewModal({ open, onClose, product, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating || rating < 1) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const productId = product.product?._id || product.product || product._id;
      await createReviewApi({
        product: productId,
        rating,
        comment: comment.trim(),
      });

      // Reset form
      setRating(0);
      setComment("");
      setError("");

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      setError(err.message || "Không thể tạo đánh giá. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const productName = product.product?.name || product.name || "Sản phẩm";

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>Đánh giá sản phẩm</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.productInfo}>
            <strong>{productName}</strong>
          </div>

          <form onSubmit={handleSubmit} className={styles.reviewForm}>
            <div className={styles.ratingSection}>
              <label>Đánh giá của bạn:</label>
              <StarRating
                value={rating}
                onChange={setRating}
                max={5}
              />
              {rating > 0 && (
                <span className={styles.ratingText}>
                  {rating} {rating === 1 ? "sao" : "sao"}
                </span>
              )}
            </div>

            <div className={styles.commentSection}>
              <label htmlFor="comment">Nhận xét (tùy chọn):</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                rows={5}
                maxLength={500}
              />
              <div className={styles.charCount}>
                {comment.length}/500 ký tự
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !rating}
              >
                {loading ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

