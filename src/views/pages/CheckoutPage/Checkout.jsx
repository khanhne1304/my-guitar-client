// src/views/pages/checkout/Checkout.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './checkout.module.css';

import Header from '../../components/HomePageItems/Header/Header';
import Footer from '../../components/HomePageItems/Footer/HomePageFooter';
import { MOCK_PRODUCTS } from '../../components/Data/dataProduct';
import { STORES } from '../../components/Data/stores';
import SuccessModal from '../../components/Modal/SuccessModal/SuccessModal';
import { useCart } from '../../../context/CartContext';

import ShipTabs from '../../components/checkout/ShipTabs';
import AddressForm from '../../components/checkout/AddressForm';
import PickupStoreList from '../../components/checkout/PickupStoreList';
import ShipMethods from '../../components/checkout/ShipMethods';
import PaymentMethods from '../../components/checkout/PaymentMethods';
import NoteBox from '../../components/checkout/NoteBox';
import OrderItems from '../../components/checkout/OrderItems';
import VnpayQR from '../../components/checkout/VnpayQR';
import Summary from '../../components/checkout/Summary';

import { useDeliveryState } from '../../../hooks/useDeliveryState';
import { useStoresEligibility } from '../../../hooks/useStoresEligibility';

const SHIP_METHODS = [
  { id: 'economy', name: 'Tiết kiệm', eta: '2–4 ngày', fee: 15000 },
  { id: 'standard', name: 'Nhanh', eta: '24–48 giờ', fee: 30000 },
  { id: 'express', name: 'Hỏa tốc', eta: '2–4 giờ (nội thành)', fee: 80000 },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();

  const [showSuccess, setShowSuccess] = useState(false);
  const { mode, setMode, shipMethod, setShipMethod, delivery } = useDeliveryState();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    country: 'Vietnam',
    address: '',
    district: '',
    method: 'cod', // cod | onpay-atm | onpay-visa | onpay-installment
    note: '',
  });

  // Cửa hàng đủ tồn kho khi nhận tại cửa hàng
  const { eligibleStores } = useStoresEligibility(cartItems, STORES);
  const [storeId, setStoreId] = useState('');
  const pickedStore = useMemo(
    () => eligibleStores.find((s) => s.id === storeId),
    [eligibleStores, storeId]
  );

  // Phí ship + tổng
  const shipFee = useMemo(
    () => (mode === 'pickup' ? 0 : SHIP_METHODS.find((m) => m.id === shipMethod)?.fee || 0),
    [mode, shipMethod]
  );
  const total = useMemo(() => subtotal + shipFee, [subtotal, shipFee]);

  // VNPay demo
  const payIsOnline = ['onpay-atm', 'onpay-visa'].includes(form.method);
  const [orderId] = useState(() => `MM${Date.now()}`);
  const orderInfo = `Thanh toan don ${orderId}`;
  const vnpayPayload = `VNPAY|ORDER=${orderId}|AMOUNT=${total}|INFO=${orderInfo}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    vnpayPayload
  )}`;
  const [showQR, setShowQR] = useState(false);
  const [paid, setPaid] = useState(false);

  // Đặt hàng
  const placeOrder = () => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống.');
      navigate('/cart');
      return;
    }

    if (mode === 'delivery') {
      if (!form.name || !form.phone || !form.address || !form.district) {
        alert('Vui lòng nhập đầy đủ thông tin giao hàng!');
        return;
      }
    } else {
      if (!storeId) {
        alert('Vui lòng chọn cửa hàng để nhận!');
        return;
      }
    }

    // Thanh toán online: lần 1 hiển thị QR, lần 2 yêu cầu đã thanh toán
    if (payIsOnline) {
      if (!showQR) {
        setShowQR(true);
        return;
      }
      if (!paid) {
        alert("Vui lòng quét QR VNPay và bấm 'Tôi đã thanh toán' để tiếp tục.");
        return;
      }
    }

    // Hoàn tất đơn (demo)
    clearCart();
    setShowSuccess(true);
  };

  return (
    <div className={styles.page}>
      <Header products={MOCK_PRODUCTS} />

      <main className={styles.main}>
        <div className={styles.container}>
          <h2 className={styles.brand}>
            My Music <span>Shop</span>
          </h2>

          <div className={styles.grid}>
            {/* LEFT */}
            <section className={styles.left}>
              <div className={styles.box}>
                <ShipTabs mode={mode} onChange={setMode} />

                {mode === 'delivery' ? (
                  <AddressForm form={form} setForm={setForm} />
                ) : (
                  <PickupStoreList
                    stores={eligibleStores}
                    cartItems={cartItems}
                    storeId={storeId}
                    setStoreId={setStoreId}
                  />
                )}
              </div>

              <div className={styles.box}>
                <div className={styles.boxTitle}>Phương thức giao hàng</div>
                <ShipMethods
                  visible={mode === 'delivery'}
                  methods={SHIP_METHODS}
                  shipMethod={shipMethod}
                  setShipMethod={setShipMethod}
                />
              </div>

              <div className={styles.box}>
                <div className={styles.boxTitle}>Phương thức thanh toán</div>
                <PaymentMethods
                  method={form.method}
                  setMethod={(m) => setForm({ ...form, method: m })}
                  onSwitch={() => {
                    // reset khi đổi phương thức thanh toán
                    setPaid(false);
                    setShowQR(false);
                  }}
                />
              </div>

              <NoteBox value={form.note} onChange={(v) => setForm({ ...form, note: v })} />
            </section>

            {/* RIGHT */}
            <aside className={styles.right}>
              <OrderItems items={cartItems} />

              <div className={styles.delivery}>
                {mode === 'delivery' ? (
                  <>
                    <span>Delivery Time :</span>{' '}
                    <b>
                      {delivery
                        ? `${delivery.dateLabel} ${delivery.timeSlot}`
                        : 'Chưa chọn (hãy xác nhận ở Giỏ hàng)'}
                    </b>
                  </>
                ) : (
                  <>
                    <span>Pickup at :</span>{' '}
                    <b>{pickedStore ? `${pickedStore.name} – ${pickedStore.address}` : 'Chưa chọn cửa hàng'}</b>
                  </>
                )}
              </div>

              <VnpayQR
                visible={payIsOnline}
                showQR={showQR}
                setShowQR={setShowQR}
                paid={paid}
                setPaid={setPaid}
                orderId={orderId}
                total={total}
                orderInfo={orderInfo}
                qrUrl={qrUrl}
              />

              <div className={styles.couponBox}>
                <div className={styles.cartTitle}>Mã khuyến mãi</div>
                <div className={styles.couponRow}>
                  <input className={styles.input} placeholder="Nhập mã khuyến mãi" />
                  <button className={styles.grayBtn}>Áp dụng</button>
                </div>
              </div>

              <Summary subtotal={subtotal} shipFee={shipFee} total={total} onPlace={placeOrder} />
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal thành công */}
      <SuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate('/');
        }}
        onContinue={() => {
          setShowSuccess(false);
          navigate('/productsCategory');
        }}
      />
    </div>
  );
}
