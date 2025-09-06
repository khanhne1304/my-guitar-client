// src/context/CartContext.jsx
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';

import { getToken } from '../utils/storage';
import {
  getMyCart,
  updateItemQty as apiUpdateItemQty,
  removeItemInCart as apiRemoveItem,
  addItemToCart as apiAddItem,
} from '../services/cartService';

// 🆕 localStorage helpers để fallback khi refresh
import {
  getStoredCart,
  setStoredCart,
  clearStoredCart as clearStoredCartUtil,
} from '../utils/cartStorage';

const CartCtx = createContext(null);

// Normalize 1 item từ mọi nguồn (server/local/component)
const normalizeItem = (it) => {
  const productId =
    it?.productId || it?._id || it?.id || it?.product?._id || it?.productId;
  const priceRaw =
    typeof it?.price === 'number'
      ? it.price
      : it?.product?.price?.sale ?? it?.product?.price?.base ?? 0;

  const qty =
    Number(it?.qty ?? it?.quantity ?? 1) > 0
      ? Number(it?.qty ?? it?.quantity ?? 1)
      : 1;

  const image =
    it?.image ?? it?.images?.[0]?.url ?? it?.product?.images?.[0]?.url ?? '';

  return {
    productId,
    name: it?.name ?? it?.product?.name ?? '',
    image,
    price: Number(priceRaw) || 0,
    qty,
    slug: it?.slug ?? it?.product?.slug ?? '',
  };
};

// 🆕 Merge 2 giỏ (serverItems, localItems): cộng dồn qty theo productId
const mergeCarts = (serverItems, localItems) => {
  const map = new Map();
  for (const raw of [...serverItems, ...localItems]) {
    const it = normalizeItem(raw);
    if (!it.productId) continue;
    const prev = map.get(it.productId);
    if (!prev) {
      map.set(it.productId, { ...it });
    } else {
      map.set(it.productId, { ...prev, qty: (prev.qty || 0) + (it.qty || 0) });
    }
  }
  return Array.from(map.values());
};

export function CartProvider({ children }) {
  // 🆕 khởi tạo từ localStorage để tránh trống khi refresh
  const [items, setItems] = useState(() => {
    const stored = getStoredCart();
    return (stored || []).map(normalizeItem);
  });
  const [loading, setLoading] = useState(false);

  // 🆕 mọi thay đổi items đều ghi xuống localStorage làm fallback
  useEffect(() => {
    setStoredCart(items);
  }, [items]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0),
        0,
      ),
    [items],
  );

  const normalizeApiItem = (it) => normalizeItem(it);

  // Load giỏ hàng theo user (nếu có token) và merge với local
  const loadMyCart = useCallback(async () => {
    const token = getToken();
    if (!token) return; // chưa đăng nhập -> giữ local
    setLoading(true);
    try {
      const data = await getMyCart(token);
      const serverItems = (data?.items || []).map(normalizeApiItem);
      const localItems = getStoredCart().map(normalizeItem);
      const merged = mergeCarts(serverItems, localItems);
      setItems(merged);
      setStoredCart(merged);
    } catch (e) {
      console.error('Load cart fail', e);
      // vẫn giữ local khi lỗi
    } finally {
      setLoading(false);
    }
  }, []);

  // Local update tiện dụng
  const localUpdate = (productId, nextQty) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.productId === productId ? { ...it, qty: nextQty } : it,
        )
        .filter((it) => Number(it.qty) > 0),
    );
  };

  const inc = async (productId) => {
    const token = getToken();
    const cur = items.find((i) => i.productId === productId);
    const nextQty = (cur?.qty || 0) + 1;

    // optimistic update
    localUpdate(productId, nextQty);

    if (token) {
      try {
        await apiUpdateItemQty(productId, nextQty, token);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const dec = async (productId) => {
    const token = getToken();
    const cur = items.find((i) => i.productId === productId);
    const nextQty = Math.max(0, (cur?.qty || 0) - 1);

    // optimistic update
    localUpdate(productId, nextQty);

    if (token) {
      try {
        if (nextQty > 0) await apiUpdateItemQty(productId, nextQty, token);
        else await apiRemoveItem(productId, token);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const updateQty = async (productId, qty) => {
    const token = getToken();
    const nextQty = Math.max(0, Number(qty) || 0);

    // optimistic update
    localUpdate(productId, nextQty);

    if (token) {
      try {
        if (nextQty > 0) await apiUpdateItemQty(productId, nextQty, token);
        else await apiRemoveItem(productId, token);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const removeItem = async (productId) => {
    const token = getToken();

    // optimistic update
    setItems((prev) => prev.filter((it) => it.productId !== productId));

    if (token) {
      try {
        await apiRemoveItem(productId, token);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 🆕 Clear toàn bộ (context + localStorage)
  const clearCart = () => {
    setItems([]);
    clearStoredCartUtil();
  };

  // Thêm item: cập nhật UI trước, rồi gọi API nếu có token
  const addItem = async (productId, qty = 1, meta = {}) => {
    const token = getToken();

    setItems((prev) => {
      const cur = prev.find((i) => i.productId === productId);
      if (cur) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, qty: (i.qty || 0) + (qty || 0) }
            : i,
        );
      }
      return [
        ...prev,
        normalizeItem({
          productId,
          qty,
          ...meta,
        }),
      ];
    });

    if (token) {
      try {
        await apiAddItem(productId, qty, token);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 🔁 Alias tương thích ngược với code cũ
  // Cho phép: addToCart(productObject, qty) hoặc addToCart(productId, qty)
  const addToCart = async (productOrId, qty = 1) => {
    let productId = productOrId;
    if (productOrId && typeof productOrId === 'object') {
      productId =
        productOrId._id ||
        productOrId.id ||
        productOrId.productId ||
        productOrId.product?._id;
    }
    if (!productId) {
      console.warn('addToCart: thiếu productId');
      return;
    }

    const meta = {};
    if (typeof productOrId === 'object') {
      meta.name = productOrId.name ?? productOrId.product?.name;
      meta.image =
        productOrId.images?.[0]?.url ??
        productOrId.product?.images?.[0]?.url ??
        productOrId.image;
      const priceFromObj =
        productOrId.price?.sale ?? productOrId.price?.base ?? productOrId.price;
      meta.price = typeof priceFromObj === 'number' ? priceFromObj : 0;
      meta.slug = productOrId.slug ?? productOrId.product?.slug;
    }

    await addItem(productId, qty, meta);
  };

  const value = {
    cartItems: items,
    subtotal,
    loading,
    loadMyCart,
    inc,
    dec,
    updateQty,
    removeItem,
    addItem,
    addToCart, // alias cho code cũ
    clearCart, // 🆕 để Checkout xoá cả context & storage
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
