import styles from '../../pages/CartPage/CartPage.module.css';
import { fmtVND } from '../../../utils/currency';

export default function SummaryBox({ subtotal, agree, setAgree, onCheckout }) {
  return (
    <div className={styles['cart__right']}>
      <h3 className={styles['cart__box-title']}>Thông tin đơn hàng</h3>

      <div className={styles['cart__total-row']}>
        <span>Tổng tiền:</span>
        <b className={styles['cart__total']}>{fmtVND(subtotal)}</b>
      </div>

      <ul className={styles['cart__notes']}>
        <li>Phí vận chuyển sẽ được tính ở trang thanh toán.</li>
        <li>Bạn cũng có thể nhập mã giảm giá ở trang thanh toán.</li>
      </ul>

      <label className={styles['cart__agree']}>
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <span>Tôi đã đọc và đồng ý với các điều khoản của đơn vị.</span>
      </label>

      <button
        className={styles['cart__checkout-btn']}
        disabled={!agree}
        onClick={onCheckout}
      >
        THANH TOÁN
      </button>
    </div>
  );
}
