// src/views/pages/CartPage/Cart.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CartPage.module.css';

import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/HomePageFooter';
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
    cartItems, subtotal, inc, dec, updateQty, removeItem, loadMyCart, loading,
  } = useCart();

  const navigate = useNavigate();

  const [note, setNote] = useState('');
  const [invoice, setInvoice] = useState(false);
  const [agree, setAgree] = useState(false);

  const {
    shipMode, setShipMode, dayOption, setDayOption, customDate, setCustomDate,
    timeSlot, setTimeSlot, confirmed, setConfirmed, confirm, payload,
  } = useDeliveryTime();

  useEffect(() => {
    const u = getUser();
    if (u?.id || u?._id) { loadMyCart?.(); }
  }, [loadMyCart]);

  const isEmpty = useMemo(
    () => !loading && Array.isArray(cartItems) && cartItems.length === 0,
    [loading, cartItems],
  );

  const getItemId = (it) =>
    it?.productId || it?._id || it?.id || it?.product?._id || it?.slug;

  const getItemQty = (it) => Number(it?.qty ?? it?.quantity ?? 0) || 0;

  const handleInc = (item) => {
    const id = getItemId(item);
    if (!id) return;
    if (typeof inc === 'function') inc(id);
    else if (typeof updateQty === 'function') updateQty(id, getItemQty(item) + 1);
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
      if (diff > 0 && typeof inc === 'function') for (let i = 0; i < diff; i++) inc(id);
      else if (diff < 0 && typeof dec === 'function') for (let i = 0; i < -diff; i++) dec(id);
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
    if (!confirm()) { alert('Vui lòng chọn ngày/giờ hợp lệ.'); return; }
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
    <div className={styles.cart}>
      <Header products={MOCK_PRODUCTS} />

      <main className={styles['cart__main']}>
        <div className={styles['cart__container']}>
          <h2 className={styles['cart__title']}>Giỏ hàng của bạn</h2>

          {loading ? (
            <p className={styles['cart__caption']}>Đang tải giỏ hàng…</p>
          ) : isEmpty ? (
            <EmptyCart onShop={() => navigate('/products')} />
          ) : (
            <div className={styles['cart__grid']}>
              <section className={styles['cart__left']}>
                <p className={styles['cart__caption']}>
                  Bạn đang có <b>{cartItems?.length || 0}</b> sản phẩm trong giỏ hàng
                </p>

                {/* CartList nên render các item dùng class riêng (block của nó).
                    Nếu bạn muốn style trực tiếp từ trang, truyền className bên dưới */}
                <CartList
                  items={cartItems}
                  classNameList={styles['cart__list']}
                  classNameRow={styles['cart__row']}
                  classNamePic={styles['cart__pic']}
                  classNameInfo={styles['cart__info']}
                  classNameName={styles['cart__name']}
                  classNameSku={styles['cart__sku']}
                  classNamePriceRow={styles['cart__price-row']}
                  classNamePrice={styles['cart__price']}
                  classNameQtyRow={styles['cart__qty-row']}
                  classNameQtyBtn={styles['cart__qty-btn']}
                  classNameQtyInput={styles['cart__qty-input']}
                  classNameRemoveBtn={styles['cart__remove-btn']}
                  onInc={handleInc}
                  onDec={handleDec}
                  onUpdate={handleUpdateQty}
                  onRemove={handleRemove}
                  onIncreaseQty={handleInc}
                  onDecreaseQty={handleDec}
                  onChangeQty={handleUpdateQty}
                  onRemoveItem={handleRemove}
                  onDelete={handleRemove}
                />

                <NoteBox
                  note={note}
                  onChange={setNote}
                  className={styles['cart__note']}
                  titleClassName={styles['cart__note-title']}
                  textareaClassName={styles['cart__note-textarea']}
                />

                <InvoiceCheck
                  checked={invoice}
                  onChange={setInvoice}
                  className={styles['cart__invoice']}
                />
              </section>

              <aside className={styles['cart__right']}>
                <h3 className={styles['cart__box-title']}>Thông tin đơn hàng</h3>

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
                  /* truyền thêm class để khớp style BEM của trang nếu component hỗ trợ */
                  rootClassName={styles['cart__ship-time-box']}
                  headerClassName={styles['cart__ship-header']}
                  timeRowClassName={styles['cart__time-row']}
                  colClassName={styles['cart__col']}
                  inlineClassName={styles['cart__inline']}
                  confirmBtnClassName={styles['cart__confirm-btn']}
                  okClassName={styles['cart__confirm-ok']}
                  warnClassName={styles['cart__confirm-warn']}
                />

                <SummaryBox
                  subtotal={subtotal}
                  agree={agree}
                  setAgree={setAgree}
                  onCheckout={handleCheckout}
                  notesClassName={styles['cart__notes']}
                  paymentInfoClassName={styles['cart__payment-info']}
                  agreeClassName={styles['cart__agree']}
                  checkoutBtnClassName={styles['cart__checkout-btn']}
                  totalRowClassName={styles['cart__total-row']}
                  totalClassName={styles['cart__total']}
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
