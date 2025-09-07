import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CheckoutPage.module.css';

import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/HomePageFooter';
import { MOCK_PRODUCTS } from '../../components/Data/dataProduct';
import { STORES } from '../../components/Data/stores';
import SuccessModal from '../../components/modal/SuccessModal/SuccessModal';
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
import { getUser } from '../../../utils/storage';

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
    name: '', phone: '', email: '', country: 'Vietnam',
    address: '', district: '', method: 'cod', note: '',
  });

  useEffect(() => {
    const u = getUser?.();
    if (!u) return;
    const fullName = u.fullName || u.name || '';
    const email = u.email || '';
    const phone = u.phone || u.phoneNumber || '';
    const addrObj =
      typeof u.address === 'object' && u.address !== null
        ? u.address
        : { address: u.address || '' };

    setForm((prev) => ({
      ...prev,
      name: prev.name || fullName,
      email: prev.email || email,
      phone: prev.phone || phone,
      address: prev.address || addrObj.address || addrObj.street || '',
      district: prev.district || addrObj.district || addrObj.ward || '',
      country: prev.country || addrObj.country || 'Vietnam',
    }));
  }, []);

  const { eligibleStores } = useStoresEligibility(cartItems, STORES);
  const [storeId, setStoreId] = useState('');
  const pickedStore = useMemo(
    () => eligibleStores.find((s) => s.id === storeId),
    [eligibleStores, storeId],
  );

  const shipFee = useMemo(
    () => (mode === 'pickup' ? 0 : SHIP_METHODS.find((m) => m.id === shipMethod)?.fee || 0),
    [mode, shipMethod],
  );
  const total = useMemo(() => subtotal + shipFee, [subtotal, shipFee]);

  const payIsOnline = ['onpay-atm', 'onpay-visa'].includes(form.method);
  const [orderId] = useState(() => `MM${Date.now()}`);
  const orderInfo = `Thanh toan don ${orderId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    `VNPAY|ORDER=${orderId}|AMOUNT=${total}|INFO=${orderInfo}`,
  )}`;
  const [showQR, setShowQR] = useState(false);
  const [paid, setPaid] = useState(false);

  const placeOrder = () => {
    if (cartItems.length === 0) { alert('Giỏ hàng trống.'); navigate('/cart'); return; }
    if (mode === 'delivery') {
      if (!form.name || !form.phone || !form.address || !form.district) {
        alert('Vui lòng nhập đầy đủ thông tin giao hàng!'); return;
      }
    } else if (!storeId) { alert('Vui lòng chọn cửa hàng để nhận!'); return; }

    if (payIsOnline) {
      if (!showQR) { setShowQR(true); return; }
      if (!paid) { alert("Vui lòng quét QR VNPay và bấm 'Tôi đã thanh toán'."); return; }
    }
    clearCart();
    setShowSuccess(true);
  };

  return (
    <div className={styles.checkout}>
      <Header products={MOCK_PRODUCTS} />

      <main className={styles['checkout__main']}>
        <div className={styles['checkout__container']}>
          <h2 className={styles['checkout__brand']}>My Music <span>Shop</span></h2>

          <div className={styles['checkout__grid']}>
            {/* LEFT */}
            <section className={styles['checkout__left']}>
              <div className={styles['checkout__box']}>
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

              <div className={styles['checkout__box']}>
                <div className={styles['checkout__box-title']}>Phương thức giao hàng</div>
                <ShipMethods
                  visible={mode === 'delivery'}
                  methods={SHIP_METHODS}
                  shipMethod={shipMethod}
                  setShipMethod={setShipMethod}
                />
              </div>

              <div className={styles['checkout__box']}>
                <div className={styles['checkout__box-title']}>Phương thức thanh toán</div>
                <PaymentMethods
                  method={form.method}
                  setMethod={(m) => setForm({ ...form, method: m })}
                  onSwitch={() => { setPaid(false); setShowQR(false); }}
                />
              </div>

              <NoteBox value={form.note} onChange={(v) => setForm({ ...form, note: v })} />
            </section>

            {/* RIGHT */}
            <aside className={styles['checkout__right']}>
              <OrderItems items={cartItems} />

              <div className={styles['checkout__delivery']}>
                {mode === 'delivery' ? (
                  <>
                    <span>Delivery Time :</span>{' '}
                    <b>{delivery ? `${delivery.dateLabel} ${delivery.timeSlot}` : 'Chưa chọn (hãy xác nhận ở Giỏ hàng)'}</b>
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

              <div className={styles['checkout__coupon-box']}>
                <div className={styles['checkout__cart-title']}>Mã khuyến mãi</div>
                <div className={styles['checkout__coupon-row']}>
                  <input
                    className={styles['checkout__input']}
                    placeholder="Nhập mã khuyến mãi"
                  />
                  <button className={styles['checkout__btn--dark']}>Áp dụng</button>
                </div>
              </div>

              {/* Nếu Summary cho phép truyền class cho nút Đặt hàng */}
              <Summary
                subtotal={subtotal}
                shipFee={shipFee}
                total={total}
                onPlace={placeOrder}
                placeBtnClass={styles['checkout__place-btn']}
              />
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <SuccessModal
        open={showSuccess}
        onClose={() => { setShowSuccess(false); navigate('/'); }}
        onContinue={() => { setShowSuccess(false); navigate('/productsCategory'); }}
      />
    </div>
  );
}
