// src/views/pages/CartPage/Cart.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './cart.module.css';

import Header from '../../components/HomePageItems/Header/Header';
import Footer from '../../components/HomePageItems/Footer/HomePageFooter';
import { MOCK_PRODUCTS } from '../../components/Data/dataProduct';

import { useCart } from '../../../context/CartContext';

import EmptyCart from '../../components/cart/EmptyCart';
import CartList from '../../components/cart/CartList';
import NoteBox from '../../components/cart/NoteBox';
import InvoiceCheck from '../../components/cart/InvoiceCheck';
import DeliveryTimeBox from '../../components/cart/DeliveryTimeBox';
import SummaryBox from '../../components/cart/SummaryBox';

import { useDeliveryTime } from '../../../hooks/useDeliveryTime';

export default function Cart() {
  const { cartItems, subtotal, inc, dec, updateQty, removeItem } = useCart();
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

  const isEmpty = cartItems.length === 0;

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

          {isEmpty ? (
            <EmptyCart onShop={() => navigate('/products')} />
          ) : (
            <div className={styles.grid}>
              <section className={styles.left}>
                <p className={styles.caption}>
                  Bạn đang có <b>{cartItems.length}</b> sản phẩm trong giỏ hàng
                </p>

                <CartList
                  items={cartItems}
                  onDec={dec}
                  onInc={inc}
                  onUpdate={updateQty}
                  onRemove={removeItem}
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
