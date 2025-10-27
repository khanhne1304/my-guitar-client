import { useEffect, useState } from "react";
import styles from "./ReviewManager.module.css";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function ReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Vui lòng đăng nhập lại');
        return;
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (ratingFilter) params.append('rating', ratingFilter);

      const url = `${API_BASE}/api/admin/reviews?${params}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách bình luận');
      }

      const data = await response.json();
      setReviews(data.reviews);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể xóa bình luận');
      }

      // Refresh danh sách
      fetchReviews(currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReviews(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchReviews(page);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? styles.starFilled : styles.starEmpty}>
        ★
      </span>
    ));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý bình luận</h2>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Search và Filter */}
      <div className={styles.filters}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Tìm kiếm theo nội dung bình luận..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Tìm kiếm
          </button>
        </form>

        <select
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value);
            setCurrentPage(1);
            fetchReviews(1);
          }}
          className={styles.filterSelect}
        >
          <option value="">Tất cả đánh giá</option>
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </select>
      </div>

      {/* Danh sách reviews */}
      <div className={styles.reviewsList}>
        {reviews.length === 0 ? (
          <div className={styles.noData}>Không có bình luận nào</div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.userInfo}>
                  <strong>{review.user?.fullName || review.user?.username}</strong>
                  <span className={styles.userEmail}>{review.user?.email}</span>
                </div>
                <div className={styles.reviewMeta}>
                  <div className={styles.rating}>
                    {renderStars(review.rating)}
                  </div>
                  <span className={styles.date}>
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <div className={styles.productInfo}>
                <strong>Sản phẩm:</strong> {review.product?.name}
              </div>

              {review.comment && (
                <div className={styles.comment}>
                  <strong>Bình luận:</strong>
                  <p>{review.comment}</p>
                </div>
              )}

              <div className={styles.actions}>
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className={styles.deleteButton}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className={styles.pageButton}
          >
            Trước
          </button>
          
          <span className={styles.pageInfo}>
            Trang {pagination.currentPage} / {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className={styles.pageButton}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
