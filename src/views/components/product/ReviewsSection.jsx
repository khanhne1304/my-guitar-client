import { useState, useEffect } from "react";
import StarRating from "../rating/StarRating";
import ReviewModal from "../review/ReviewModal";
import { getReviewsApi, getReviewableProductsApi } from "../../../services/reviewService";
import { useAuth } from "../../../context/AuthContext";
import { getUser } from "../../../utils/storage";
import styles from "./ReviewsSection.module.css";

export default function ReviewsSection({ product }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const { user: authUser } = useAuth();
  const currentUser = authUser || getUser();

  useEffect(() => {
    if (product?._id) {
      loadReviews();
      checkCanReview();
    }
  }, [product?._id]);

  const loadReviews = async () => {
    if (!product?._id) return;
    
    setLoading(true);
    setError("");
    try {
      const data = await getReviewsApi(product._id);
      setReviews(Array.isArray(data) ? data : []);
      
      // Tìm review của user hiện tại
      if (currentUser?._id) {
        const currentUserId = currentUser._id;
        const myReview = data.find((r) => {
          const reviewUserId = r.user?._id || r.user;
          return reviewUserId === currentUserId || reviewUserId?.toString() === currentUserId?.toString();
        });
        setUserReview(myReview || null);
      }
    } catch (err) {
      setError(err.message || "Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    if (!currentUser?._id || !product?._id) {
      setCanReview(false);
      return;
    }

    try {
      const reviewableProducts = await getReviewableProductsApi();
      const canReviewProduct = reviewableProducts.some((item) => {
        const productId = item.product?._id || item.product?._id || item.product;
        return productId === product._id || productId?.toString() === product._id?.toString();
      });
      // Chỉ cho phép đánh giá nếu chưa có review của user
      setCanReview(canReviewProduct && !userReview);
    } catch (err) {
      console.error("Error checking can review:", err);
      setCanReview(false);
    }
  };

  useEffect(() => {
    if (product?._id && currentUser?._id && !loading) {
      checkCanReview();
    }
  }, [product?._id, currentUser?._id, userReview, loading]);

  const handleReviewSuccess = () => {
    loadReviews();
    checkCanReview();
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    percentage: reviews.length > 0
      ? ((reviews.filter((r) => r.rating === stars).length / reviews.length) * 100).toFixed(0)
      : 0,
  }));

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.reviewsHeader}>
        <h3 className={styles.reviewsTitle}>Đánh giá sản phẩm</h3>
        {reviews.length > 0 && (
          <div className={styles.ratingSummary}>
            <div className={styles.ratingAverage}>
              <span className={styles.ratingNumber}>{averageRating}</span>
              <StarRating value={Math.round(parseFloat(averageRating))} max={5} />
              <span className={styles.ratingCount}>({reviews.length} đánh giá)</span>
            </div>
          </div>
        )}
      </div>

      {canReview && (
        <div className={styles.reviewPrompt}>
          <p>Bạn đã mua sản phẩm này và chưa đánh giá. Hãy chia sẻ cảm nhận của bạn!</p>
          <button
            className={styles.reviewBtn}
            onClick={() => setReviewModalOpen(true)}
          >
            Viết đánh giá
          </button>
        </div>
      )}

      {userReview && (
        <div className={styles.myReview}>
          <div className={styles.myReviewHeader}>
            <h4>Đánh giá của bạn</h4>
            <div className={styles.myReviewRating}>
              <StarRating value={userReview.rating} max={5} />
              <span className={styles.myReviewDate}>
                {new Date(userReview.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
          {userReview.comment && (
            <p className={styles.myReviewComment}>{userReview.comment}</p>
          )}
        </div>
      )}

      {loading && <div className={styles.loading}>Đang tải đánh giá...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && reviews.length === 0 && (
        <div className={styles.empty}>
          Chưa có đánh giá nào cho sản phẩm này.
          {!currentUser && (
            <p className={styles.loginPrompt}>
              <a href="/login">Đăng nhập</a> để xem và viết đánh giá
            </p>
          )}
        </div>
      )}

      {reviews.length > 0 && (
        <>
          <div className={styles.ratingDistribution}>
            <h4>Phân bố đánh giá</h4>
            <div className={styles.ratingBars}>
              {ratingCounts.map(({ stars, count, percentage }) => (
                <div key={stars} className={styles.ratingBar}>
                  <span className={styles.ratingLabel}>{stars} sao</span>
                  <div className={styles.barContainer}>
                    <div
                      className={styles.bar}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={styles.ratingPercentage}>({count})</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.reviewsList}>
            <h4>Danh sách đánh giá ({reviews.length})</h4>
            {reviews.map((review) => {
              const reviewUserId = review.user?._id || review.user;
              const isMyReview = currentUser?._id && (
                reviewUserId === currentUser._id || reviewUserId?.toString() === currentUser._id?.toString()
              );

              return (
                <div key={review._id} className={`${styles.reviewItem} ${isMyReview ? styles.myReviewItem : ""}`}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewUser}>
                      <strong>{review.user?.fullName || review.user?.username || "Khách"}</strong>
                      {isMyReview && <span className={styles.myBadge}>(Bạn)</span>}
                    </div>
                    <div className={styles.reviewMeta}>
                      <StarRating value={review.rating} max={5} />
                      <span className={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className={styles.reviewComment}>{review.comment}</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Review Modal */}
      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        product={{
          _id: product?._id,
          name: product?.name,
        }}
        onSuccess={handleReviewSuccess}
      />
    </section>
  );
}

