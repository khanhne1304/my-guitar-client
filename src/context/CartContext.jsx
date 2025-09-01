import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Thêm vào giỏ (nếu đã có thì +qty)
  const addToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i._id === product._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          qty: Math.min((next[idx].qty || 0) + qty, product.stock ?? 9999),
        };
        return next;
      }
      return [...prev, { ...product, qty }];
    });
  };

  // Cập nhật số lượng
  const updateQty = (_id, qty) => {
    setCartItems((prev) =>
      prev.map((i) => (i._id === _id ? { ...i, qty: Math.max(1, qty) } : i))
    );
  };

  // Tăng/giảm nhanh
  const inc = (_id, stock = 9999) =>
    setCartItems((prev) =>
      prev.map((i) =>
        i._id === _id ? { ...i, qty: Math.min(i.qty + 1, stock) } : i
      )
    );
  const dec = (_id) =>
    setCartItems((prev) =>
      prev.map((i) => (i._id === _id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))
    );

  // Xoá dòng
  const removeItem = (_id) =>
    setCartItems((prev) => prev.filter((i) => i._id !== _id));

  // Xoá sạch
  const clearCart = () => setCartItems([]);

  // Tổng số sp + tổng tiền
  const totalItems = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.qty, 0),
    [cartItems]
  );
  const subtotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        inc,
        dec,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
