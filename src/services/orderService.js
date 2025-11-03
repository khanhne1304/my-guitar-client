// src/services/orderService.js
import { apiClient } from './apiClient';
import { getToken as getStoredToken } from '../utils/storage';

/**
 * Map payload từ Checkout.jsx (cart/pricing/shipping/payment/...) sang
 * body đúng theo schema Mongo:
 * {
 *   items: [{ product, name, price, qty }],
 *   shippingAddress: { phone, city, district, address? },
 *   paymentMethod: 'cod' | 'vnpay',
 *   total: number
 * }
 */
// ✅ Lấy danh sách đơn hàng cho admin
export async function adminListOrdersApi() {
  try {
    const data = await apiClient.get('/orders');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("❌ adminListOrdersApi failed:", err);
    return [];
  }
}

function mapCheckoutToOrderDoc(payload) {
  // Map cart -> items
  const items = (payload?.cart || []).map((i) => ({
    product: i._id || i.id || i.productId, // ObjectId string
    name: i.name,
    price: Number(i.price) || 0,
    qty: Number(i.qty ?? i.quantity) || 0,
  }));

  // Suy ra shippingAddress
  let shippingAddress = null;

  const buyerPhone =
    payload?.buyer?.phone || payload?.shipping?.address?.phone || '';
  const buyerName = payload?.buyer?.name || payload?.buyer?.fullName || '';
  const addr = payload?.shipping?.address || null; // khi mode = 'delivery'
  const store = payload?.shipping?.pickupStore || null; // khi mode = 'pickup'

  if (payload?.shipping?.mode === 'delivery' && addr) {
    shippingAddress = {
      fullName: addr.fullName || buyerName || '',
      phone: buyerPhone || '',
      city: addr.city || addr.province || addr.country || '',
      district: addr.district || '',
      address: addr.address || '', // optional
    };
  } else if (payload?.shipping?.mode === 'pickup' && store) {
    shippingAddress = {
      fullName: store.fullName || buyerName || '',
      phone: buyerPhone || '',
      city: store.city || '',
      district: store.district || '',
      address: store.address || '',
    };
  } else {
    shippingAddress = {
      fullName: buyerName || '',
      phone: buyerPhone || '',
      city: payload?.buyer?.city || '',
      district: payload?.buyer?.district || '',
      address: payload?.buyer?.address || '',
    };
  }

  // Map payment method
  const rawMethod = (payload?.payment?.method || '').toLowerCase();
  const paymentMethod = rawMethod === 'cod' ? 'cod' : 'vnpay';

  // Tổng tiền
  const total = Number(payload?.pricing?.total) || 0;

  return {
    items,
    shippingAddress,
    paymentMethod,
    total,
  };
}

// Lấy token thống nhất từ utils/storage và chuẩn hoá tiền tố Bearer

function buildAuthHeader() {
  const raw = getStoredToken?.();
  if (!raw) {
    console.warn("⚠️ No token found in localStorage");
    return {};
  }
  const token = typeof raw === 'string' ? raw.trim() : '';
  return { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` };
}

// ✅ Lấy đơn hàng của user
export async function getMyOrdersApi() {
  try {
    const data = await apiClient.get('/orders/mine');
    console.log("✅ Orders API data:", data); // debug
    return Array.isArray(data) ? data : [];  // Đảm bảo luôn trả về mảng
  } catch (err) {
    console.error("❌ getMyOrdersApi failed:", err);
    return [];
  }
}


/**
 * Tạo đơn hàng theo schema DB + kèm Authorization
 * Mặc định POST /orders (đổi path nếu BE là /orders/checkout)
 */
export async function checkoutOrderApi(viewPayload) {
  const body = mapCheckoutToOrderDoc(viewPayload);

  try {
    const res = await apiClient.post('/orders', body, {
      headers: buildAuthHeader(),
      // Nếu BE dùng cookie-session, cần bật credentials trong apiClient
    });
    return res?.data ?? res;
  } catch (err) {
    // Chuẩn hoá thông báo lỗi 401
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      const msg =
        err?.response?.data?.message || 'Bạn cần đăng nhập để tạo đơn hàng.';
      throw new Error(msg);
    }
    // Các lỗi khác
    const msg =
      err?.response?.data?.message || err?.message || 'Không thể tạo đơn hàng.';
    throw new Error(msg);
  }
}

// ✅ Xác nhận đã nhận hàng (chỉ cho user, chỉ khi status = delivered)
export async function confirmReceivedApi(orderId) {
  try {
    const data = await apiClient.post(`/orders/${orderId}/confirm-received`);
    return data;
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Không thể xác nhận nhận hàng.';
    throw new Error(msg);
  }
}

// ✅ Hủy đơn hàng với lý do (chỉ cho user sở hữu và khi chưa delivered/completed)
export async function cancelOrderApi(orderId, reason) {
  try {
    const data = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
    return data;
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Không thể hủy đơn hàng.';
    throw new Error(msg);
  }
}

// (Optional) Export để test riêng phần mapping
export const __test__ = { mapCheckoutToOrderDoc };
