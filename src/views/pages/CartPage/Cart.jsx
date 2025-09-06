// src/views/pages/CartPage/Cart.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './cart.module.css';

import Header from '../../components/HomePageItems/Header/Header';
import Footer from '../../components/HomePageItems/Footer/HomePageFooter';
import { MOCK_PRODUCTS } from '../../components/Data/dataProduct';

import { useCart } from '../../../context/CartContext';
import { getUser } from '../../../utils/storage';

import EmptyCart from '../../components/cart/EmptyCart';
import CartList from '../../components/cart/CartList';
import NoteBox from '../../components/cart/NoteBox';
import InvoiceCheck from '../../components/cart/InvoiceCheck';
import DeliveryTimeBox from '../../components/cart/DeliveryTimeBox';
import SummaryBox from '../../components/cart/SummaryBox';

import { useDeliveryTime } from '../../../hooks/useDeliveryTime';

export default function Cart() {
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

  // 🔁 Load giỏ hàng theo user
  useEffect(() => {
    const u = getUser();
    if (u?.id || u?._id) {
      loadMyCart?.(); // an toàn nếu context cũ chưa có hàm này
    }
  }, [loadMyCart]);

  const isEmpty = useMemo(
    () => !loading && Array.isArray(cartItems) && cartItems.length === 0,
    [loading, cartItems],
  );

  // ===== Helpers để nhận diện id và qty hiện tại =====
  const getItemId = (it) =>
    it?.productId || it?._id || it?.id || it?.product?._id || it?.slug;

  const getItemQty = (it) => Number(it?.qty ?? it?.quantity ?? 0) || 0;

  // ===== Handlers tăng/giảm/cập nhật/xoá =====
  const handleInc = (item) => {
    const id = getItemId(item);
    if (!id) return;
    // ưu tiên dùng inc từ context, nếu không có thì dùng updateQty
    if (typeof inc === 'function') {
      inc(id);
    } else if (typeof updateQty === 'function') {
      const next = getItemQty(item) + 1;
      updateQty(id, next);
    }
  };

  const handleDec = (item) => {
    const id = getItemId(item);
    if (!id) return;
    const current = getItemQty(item);
    if (current <= 1) {
      // xác nhận xoá khi về 0/1
      if (window.confirm('Xoá sản phẩm này khỏi giỏ hàng?')) {
        if (typeof removeItem === 'function') removeItem(id);
      }
      return;
    }
    if (typeof dec === 'function') {
      dec(id);
    } else if (typeof updateQty === 'function') {
      updateQty(id, current - 1);
    }
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

    if (typeof updateQty === 'function') {
      updateQty(id, q);
    } else if (typeof inc === 'function' || typeof dec === 'function') {
      // fallback: gọi inc/dec tới khi đạt q (ít dùng)
      const current = cartItems?.find((x) => getItemId(x) === id);
      const cur = getItemQty(current);
      const diff = q - cur;
      if (diff > 0 && typeof inc === 'function') {
        for (let i = 0; i < diff; i++) inc(id);
      } else if (diff < 0 && typeof dec === 'function') {
        for (let i = 0; i < -diff; i++) dec(id);
      }
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

  return (
    <div className={styles.page}>
      <Header products={MOCK_PRODUCTS} />

      <main className={styles.main}>
        <div className={styles.container}>
          <h2 className={styles.title}>Giỏ hàng của bạn</h2>

          {loading ? (
            <p className={styles.caption}>Đang tải giỏ hàng…</p>
          ) : isEmpty ? (
            <EmptyCart onShop={() => navigate('/products')} />
          ) : (
            <div className={styles.grid}>
              <section className={styles.left}>
                <p className={styles.caption}>
                  Bạn đang có <b>{cartItems?.length || 0}</b> sản phẩm trong giỏ
                  hàng
                </p>

                <CartList
                  items={cartItems}
                  // props "chuẩn" hiện tại
                  onInc={handleInc}
                  onDec={handleDec}
                  onUpdate={handleUpdateQty}
                  onRemove={handleRemove}
                  // thêm alias để tương thích nhiều phiên bản CartList khác nhau
                  onIncreaseQty={handleInc}
                  onDecreaseQty={handleDec}
                  onChangeQty={handleUpdateQty}
                  onRemoveItem={handleRemove}
                  onDelete={handleRemove}
                />

                <NoteBox note={note} onChange={setNote} />
                <InvoiceCheck checked={invoice} onChange={setInvoice} />
              </section>

              <aside className={styles.right}>
                <h3 className={styles.boxTitle}>Thông tin đơn hàng</h3>

                <DeliveryTimeBox
                  shipMode={shipMode}
                  setShipMode={setShipMode}
                  dayOption={dayOption}
                  setDayOption={setDayOption}
                  customDate={customDate}
                  setCustomDate={setCustomDate}
                  timeSlot={timeSlot}
                  setTimeSlot={setTimeSlot}
                  confirmed={confirmed}
                  setConfirmed={setConfirmed}
                  onConfirm={confirmTime}
                />

                <SummaryBox
                  subtotal={subtotal}
                  agree={agree}
                  setAgree={setAgree}
                  onCheckout={handleCheckout}
                />
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
