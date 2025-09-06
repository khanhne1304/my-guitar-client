// src/services/orderService.js
import { apiClient } from './apiClient';

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
function mapCheckoutToOrderDoc(payload) {
  // Map cart -> items
  const items = (payload?.cart || []).map((i) => ({
    product: i._id || i.id || i.productId, // ObjectId string
    name: i.name,
    price: Number(i.price) || 0,
    qty: Number(i.quantity) || 0,
  }));

  // Suy ra shippingAddress
  let shippingAddress = null;

  const buyerPhone =
    payload?.buyer?.phone || payload?.shipping?.address?.phone || '';
  const addr = payload?.shipping?.address || null; // khi mode = 'delivery'
  const store = payload?.shipping?.pickupStore || null; // khi mode = 'pickup'

  if (payload?.shipping?.mode === 'delivery' && addr) {
    shippingAddress = {
      phone: buyerPhone || '',
      city:
        addr.city ||
        addr.province || // nếu FE bạn để "province"
        addr.country || // fallback (tránh null)
        '',
      district: addr.district || '',
      address: addr.address || '', // optional
    };
  } else if (payload?.shipping?.mode === 'pickup' && store) {
    shippingAddress = {
      phone: buyerPhone || '',
      city: store.city || '',
      district: store.district || '',
      address: store.address || '',
    };
  } else {
    shippingAddress = {
      phone: buyerPhone || '',
      city: '',
      district: '',
      address: '',
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

/**
 * Lấy token từ localStorage (đã được lưu bởi saveSession)
 * Nếu bạn dùng key khác, đổi lại bên dưới.
 */
function getToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

/**
 * Tạo đơn hàng theo schema DB + kèm Authorization
 * Mặc định POST /orders (đổi path nếu BE là /orders/checkout)
 */
export async function checkoutOrderApi(viewPayload) {
  const body = mapCheckoutToOrderDoc(viewPayload);
  const token = getToken();

  try {
    const res = await apiClient.post('/orders', body, {
      // Nếu BE dùng JWT Header:
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      // Nếu BE dùng cookie-session, bật dòng dưới (và server phải set CORS credentials)
      withCredentials: true,
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

// (Optional) Export để test riêng phần mapping
export const __test__ = { mapCheckoutToOrderDoc };
