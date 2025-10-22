import { apiClient } from './apiClient';

// Lấy giỏ hàng của user
export async function getMyCart(token) {
  const response = await apiClient.get('/cart', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// Thêm sản phẩm vào giỏ hàng
export async function addItemToCart(productId, qty = 1, token) {
  const response = await apiClient.post(
    '/cart/items',
    { productId, qty },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
export async function updateItemQty(productId, qty, token) {
  const response = await apiClient.patch(
    `/cart/items/${productId}`,
    { qty },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

// Xóa sản phẩm khỏi giỏ hàng
export async function removeItemInCart(productId, token) {
  const response = await apiClient.delete(`/cart/items/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// Xóa toàn bộ giỏ hàng
export async function clearCart(token) {
  const response = await apiClient.delete('/cart', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
