// CheckoutView.jsx
import styles from './CheckoutPage.module.css';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';

import ShipTabs from '../../components/checkout/ShipTabs';
import AddressForm from '../../components/checkout/AddressForm';
import PickupStoreList from '../../components/checkout/PickupStoreList';
import ShipMethods from '../../components/checkout/ShipMethods';
import PaymentMethods from '../../components/checkout/PaymentMethods';
import NoteBox from '../../components/checkout/NoteBox';
import OrderItems from '../../components/checkout/OrderItems';
import VnpayQR from '../../components/checkout/VnpayQR';
import Summary from '../../components/checkout/Summary';
import SuccessModal from '../../components/Modal/SuccessModal/SuccessModal';

import { useCheckoutViewModel } from '../../../viewmodels/CheckoutViewModel';

export default function CheckoutPage() {
  const vm = useCheckoutViewModel();

  return (
    <div className={styles.checkout}>
      <Header />

      <main className={styles['checkout__main']}>
        <div className={styles['checkout__container']}>
          <h2 className={styles['checkout__brand']}>
            My Music <span>Shop</span>
          </h2>

          <div className={styles['checkout__grid']}>
            {/* LEFT */}
            <section className={styles['checkout__left']}>
              <div className={styles['checkout__box']}>
                <ShipTabs mode={vm.mode} onChange={vm.setMode} />
                {vm.mode === 'delivery' ? (
                  <AddressForm form={vm.form} setForm={vm.setForm} />
                ) : (
                  <PickupStoreList
                    stores={vm.eligibleStores}
                    cartItems={vm.cartItems}
                    storeId={vm.storeId}
                    setStoreId={vm.setStoreId}
                  />
                )}
              </div>

              <div className={styles['checkout__box']}>
                <div className={styles['checkout__box-title']}>Phương thức giao hàng</div>
                <ShipMethods
                  visible={vm.mode === 'delivery'}
                  methods={vm.SHIP_METHODS}
                  shipMethod={vm.shipMethod}
                  setShipMethod={vm.setShipMethod}
                />
              </div>

              <div className={styles['checkout__box']}>
                <div className={styles['checkout__box-title']}>Phương thức thanh toán</div>
                <PaymentMethods
                  method={vm.form.method}
                  setMethod={(m) => vm.setForm({ ...vm.form, method: m })}
                  onSwitch={() => {
                    vm.setPaid(false);
                    vm.setShowQR(false);
                  }}
                />
              </div>

              <NoteBox
                value={vm.form.note}
                onChange={(v) => vm.setForm({ ...vm.form, note: v })}
              />
            </section>

            {/* RIGHT */}
            <aside className={styles['checkout__right']}>
              <OrderItems items={vm.cartItems} />

              <div className={styles['checkout__delivery']}>
                {vm.mode === 'delivery' ? (
                  <>
                    <span>Delivery Time :</span>{' '}
                    <b>
                      {vm.delivery
                        ? `${vm.delivery.dateLabel} ${vm.delivery.timeSlot}`
                        : 'Chưa chọn (hãy xác nhận ở Giỏ hàng)'}
                    </b>
                  </>
                ) : (
                  <>
                    <span>Pickup at :</span>{' '}
                    <b>
                      {vm.pickedStore
                        ? `${vm.pickedStore.name} – ${vm.pickedStore.address}`
                        : 'Chưa chọn cửa hàng'}
                    </b>
                  </>
                )}
              </div>

              <VnpayQR
                visible={vm.payIsOnline}
                showQR={vm.showQR}
                setShowQR={vm.setShowQR}
                paid={vm.paid}
                setPaid={vm.setPaid}
                orderId={vm.order.orderId}
                total={vm.total}
                orderInfo={vm.orderInfo}
                qrUrl={vm.qrUrl}
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

              <Summary
                subtotal={vm.order.subtotal}
                shipFee={vm.order.shipFee}
                total={vm.order.total}
                onPlace={vm.placeOrder}
                placeBtnClass={styles['checkout__place-btn']}
              />
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <SuccessModal
        open={vm.showSuccess}
        onClose={() => {
          vm.setShowSuccess(false);
          vm.navigate('/');
        }}
        onContinue={() => {
          vm.setShowSuccess(false);
          vm.navigate('/productsCategory');
        }}
      />
    </div>
  );
}
