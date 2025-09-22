// src/services/favoriteService.js
import { apiClient } from './apiClient';

// Lấy danh sách yêu thích của user
export async function getMyFavorites() {
  return apiClient.get('/favorites');
}

// Thêm sản phẩm vào yêu thích
export async function addToFavorites(productId) {
  return apiClient.post(`/favorites/${productId}`);
}

// Xóa sản phẩm khỏi yêu thích
export async function removeFromFavorites(productId) {
  return apiClient.delete(`/favorites/${productId}`);
}

// Toggle favorite status
export async function toggleFavorite(productId) {
  return apiClient.put(`/favorites/${productId}/toggle`);
}

// Kiểm tra trạng thái favorite của nhiều sản phẩm
export async function checkFavoriteStatus(productIds) {
  return apiClient.post('/favorites/check-status', { productIds });
}
