import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';
import { fmtVND } from '../../../utils/currency';

export default function Summary({ subtotal, shipFee, discount = 0, total, onPlace }) {
  return (
    <div className={styles['checkout__box']}>
      <div className={styles['checkout__box-head']}>
        <span>Tổng tiền hàng</span>
        <b>{fmtVND(subtotal)}</b>
      </div>
      <div className={styles['checkout__box-head']}>
        <span>Phí vận chuyển</span>
        <b>{fmtVND(shipFee)}</b>
      </div>
      {!!discount && (
        <div className={styles['checkout__box-head']}>
          <span>Mã giảm giá</span>
          <b>-{fmtVND(discount)}</b>
        </div>
      )}
      <div className={styles['checkout__box-head']}>
        <span><b>Tổng thanh toán</b></span>
        <b>{fmtVND(total)}</b>
      </div>
      <button
        className={styles['checkout__place-btn']}
        onClick={onPlace}
      >
        Đặt hàng
      </button>
    </div>
  );
}
