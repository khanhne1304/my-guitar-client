// CartView.jsx
import styles from './CartPage.module.css';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';

import EmptyCart from '../../components/cart/EmptyCart';
import CartList from '../../components/cart/CartList';
import NoteBox from '../../components/cart/NoteBox';
import InvoiceCheck from '../../components/cart/InvoiceCheck';
import DeliveryTimeBox from '../../components/cart/DeliveryTimeBox';
import SummaryBox from '../../components/cart/SummaryBox';

import { useCartViewModel } from '../../../viewmodels/CartViewModel';

export default function CartPage() {
  const vm = useCartViewModel();
  const { state } = vm;

  return (
    <div className={styles.cart}>
      <Header />

      <main className={styles['cart__main']}>
        <div className={styles['cart__container']}>
          <h2 className={styles['cart__title']}>Giỏ hàng của bạn</h2>

          {state.loading ? (
            <p className={styles['cart__caption']}>Đang tải giỏ hàng…</p>
          ) : vm.isEmpty ? (
            <EmptyCart onShop={() => window.location.assign('/products')} />
          ) : (
            <div className={styles['cart__grid']}>
              <section className={styles['cart__left']}>
                <p className={styles['cart__caption']}>
                  Bạn đang có <b>{state.cartItems?.length || 0}</b> sản phẩm trong giỏ hàng
                </p>

                <CartList
                  items={state.cartItems}
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
                  onInc={vm.handleInc}
                  onDec={vm.handleDec}
                  onUpdate={vm.handleUpdateQty}
                  onRemove={vm.handleRemove}
                  onIncreaseQty={vm.handleInc}
                  onDecreaseQty={vm.handleDec}
                  onChangeQty={vm.handleUpdateQty}
                  onRemoveItem={vm.handleRemove}
                  onDelete={vm.handleRemove}
                />

                <NoteBox
                  note={state.note}
                  onChange={vm.setNote}
                  className={styles['cart__note']}
                  titleClassName={styles['cart__note-title']}
                  textareaClassName={styles['cart__note-textarea']}
                />

                <InvoiceCheck
                  checked={state.invoice}
                  onChange={vm.setInvoice}
                  className={styles['cart__invoice']}
                />
              </section>

              <aside className={styles['cart__right']}>
                <h3 className={styles['cart__box-title']}>Thông tin đơn hàng</h3>

                <DeliveryTimeBox
                  shipMode={vm.shipMode}
                  setShipMode={vm.setShipMode}
                  dayOption={vm.dayOption}
                  setDayOption={vm.setDayOption}
                  customDate={vm.customDate}
                  setCustomDate={vm.setCustomDate}
                  timeSlot={vm.timeSlot}
                  setTimeSlot={vm.setTimeSlot}
                  confirmed={vm.confirmed}
                  setConfirmed={vm.setConfirmed}
                  onConfirm={vm.confirmTime}
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
                  subtotal={state.subtotal}
                  agree={state.agree}
                  setAgree={vm.setAgree}
                  onCheckout={vm.handleCheckout}
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
