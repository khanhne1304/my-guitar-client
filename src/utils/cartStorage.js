// src/utils/cartStorage.js
const CART_KEY = 'cart_items_v1';

export function getStoredCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    // Hỗ trợ cả dạng [] lẫn {items:[]}
    const arr = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.items)
      ? parsed.items
      : [];
    // Chuẩn hoá quantity/qty, id
    return arr.map((i) => ({
      ...i,
      quantity: Number(i.quantity ?? i.qty ?? 1),
      price: Number(i.price) || 0,
      _id: i._id || i.productId || i.id,
    }));
  } catch {
    return [];
  }
}

export function setStoredCart(items) {
  // lưu mảng phẳng cho đơn giản
  localStorage.setItem(CART_KEY, JSON.stringify(items || []));
}

export function clearStoredCart() {
  localStorage.removeItem(CART_KEY);
}
