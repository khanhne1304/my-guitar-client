// src/services/reviewService.js
import { apiClient } from './apiClient';

/**
 * Lấy danh sách đánh giá theo product ID
 */
export async function getReviewsApi(productId) {
  try {
    const params = productId ? `?product=${productId}` : '';
    const data = await apiClient.get(`/reviews${params}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('❌ getReviewsApi failed:', err);
    return [];
  }
}

/**
 * Lấy danh sách sản phẩm có thể đánh giá (từ đơn hàng đã hoàn thành)
 */
export async function getReviewableProductsApi() {
  try {
    const data = await apiClient.get('/reviews/reviewable');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('❌ getReviewableProductsApi failed:', err);
    return [];
  }
}

/**
 * Tạo đánh giá mới
 */
export async function createReviewApi({ product, rating, comment }) {
  try {
    const data = await apiClient.post('/reviews', {
      product,
      rating,
      comment: comment || '',
    });
    return data;
  } catch (err) {
    const message =
      err?.data?.message ||
      err?.message ||
      'Không thể tạo đánh giá. Vui lòng thử lại.';
    throw new Error(message);
  }
}

/**
 * Cập nhật đánh giá của mình
 */
export async function updateReviewApi(reviewId, { rating, comment }) {
  try {
    const data = await apiClient.patch(`/reviews/${reviewId}`, {
      rating,
      comment,
    });
    return data;
  } catch (err) {
    const message =
      err?.data?.message ||
      err?.message ||
      'Không thể cập nhật đánh giá. Vui lòng thử lại.';
    throw new Error(message);
  }
}

/**
 * Xóa đánh giá
 */
export async function deleteReviewApi(reviewId) {
  try {
    await apiClient.delete(`/reviews/${reviewId}`);
    return true;
  } catch (err) {
    const message =
      err?.data?.message ||
      err?.message ||
      'Không thể xóa đánh giá. Vui lòng thử lại.';
    throw new Error(message);
  }
}

