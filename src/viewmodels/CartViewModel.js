// CartViewModel.js
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getUser } from '../utils/storage';
import { useDeliveryTime } from '../hooks/useDeliveryTime';
import { CartState } from '../models/cartModel';

export function useCartViewModel() {
  const {
    cartItems,
    subtotal,
    inc,
    dec,
    updateQty,
    removeItem,
    loadMyCart,
    loading,
  } = useCart();

  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [invoice, setInvoice] = useState(false);
  const [agree, setAgree] = useState(false);

  const {
    shipMode,
    setShipMode,
    dayOption,
    setDayOption,
    customDate,
    setCustomDate,
    timeSlot,
    setTimeSlot,
    confirmed,
    setConfirmed,
    confirm,
    payload,
  } = useDeliveryTime();

  useEffect(() => {
    const u = getUser();
    if (u?.id || u?._id) loadMyCart?.();
  }, [loadMyCart]);

  const isEmpty = useMemo(
    () => !loading && Array.isArray(cartItems) && cartItems.length === 0,
    [loading, cartItems]
  );

  const getItemId = (it) =>
    it?.productId || it?._id || it?.id || it?.product?._id || it?.slug;

  const getItemQty = (it) => Number(it?.qty ?? it?.quantity ?? 0) || 0;

  const handleInc = (item) => {
    const id = getItemId(item);
    if (!id) return;
    if (typeof inc === 'function') inc(id);
    else if (typeof updateQty === 'function')
      updateQty(id, getItemQty(item) + 1);
  };

  const handleDec = (item) => {
    const id = getItemId(item);
    if (!id) return;
    const current = getItemQty(item);
    if (current <= 1) {
      if (window.confirm('Xoá sản phẩm này khỏi giỏ hàng?')) {
        if (typeof removeItem === 'function') removeItem(id);
      }
      return;
    }
    if (typeof dec === 'function') dec(id);
    else if (typeof updateQty === 'function') updateQty(id, current - 1);
  };

  const handleUpdateQty = (item, nextQty) => {
    const id = getItemId(item);
    const q = Math.max(0, Number(nextQty) || 0);
    if (!id) return;

    if (q === 0) {
      if (window.confirm('Xoá sản phẩm này khỏi giỏ hàng?')) {
        if (typeof removeItem === 'function') removeItem(id);
      }
      return;
    }
    if (typeof updateQty === 'function') updateQty(id, q);
    else if (typeof inc === 'function' || typeof dec === 'function') {
      const current = cartItems?.find((x) => getItemId(x) === id);
      const cur = getItemQty(current);
      const diff = q - cur;
      if (diff > 0 && typeof inc === 'function')
        for (let i = 0; i < diff; i++) inc(id);
      else if (diff < 0 && typeof dec === 'function')
        for (let i = 0; i < -diff; i++) dec(id);
    }
  };

  const handleRemove = (item) => {
    const id = getItemId(item);
    if (!id) return;
    if (window.confirm('Bạn chắc chắn muốn xoá sản phẩm này?')) {
      if (typeof removeItem === 'function') removeItem(id);
    }
  };

  const confirmTime = () => {
    if (!confirm()) {
      alert('Vui lòng chọn ngày/giờ hợp lệ.');
      return;
    }
  };

  const handleCheckout = () => {
    if (shipMode === 'schedule' && !confirmed) {
      alert('Vui lòng xác nhận thời gian giao trước khi thanh toán');
      return;
    }
    localStorage.setItem('deliveryTime', JSON.stringify(payload));
    localStorage.setItem('orderNote', note);
    localStorage.setItem('needInvoice', JSON.stringify(invoice));
    navigate('/checkout');
  };

  return {
    state: new CartState({ cartItems, subtotal, loading, note, invoice, agree }),
    setNote,
    setInvoice,
    setAgree,
    shipMode,
    setShipMode,
    dayOption,
    setDayOption,
    customDate,
    setCustomDate,
    timeSlot,
    setTimeSlot,
    confirmed,
    setConfirmed,
    confirmTime,
    handleCheckout,
    handleInc,
    handleDec,
    handleUpdateQty,
    handleRemove,
    isEmpty,
  };
}
