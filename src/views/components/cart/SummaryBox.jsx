import { Link } from 'react-router-dom';
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

      <label className={styles['cart__agree']}>
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <span>
          Tôi đã đọc và đồng ý với{' '}
          <Link
            to="/shipping-returns"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: '#b45309', textDecoration: 'underline', fontWeight: 600 }}
          >
            các điều khoản
          </Link>{' '}
          của đơn vị.
        </span>
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
