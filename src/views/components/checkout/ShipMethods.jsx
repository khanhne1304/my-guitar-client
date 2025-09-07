import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';
import { fmtVND } from '../../../utils/currency';

export default function ShipMethods({ visible, methods, shipMethod, setShipMethod }) {
  if (!visible) {
    return (
      <div className={styles['checkout__ship-placeholder']}>
        Bạn đã chọn <b>nhận tại cửa hàng</b>. Phí vận chuyển = 0đ.
      </div>
    );
  }

  return (
    <div className={styles['checkout__ship-methods']}>
      {methods.map((m) => (
        <label key={m.id} className={styles['checkout__ship-method']}>
          <input
            type="radio"
            name="ship-method"
            value={m.id}
            checked={shipMethod === m.id}
            onChange={(e) => setShipMethod(e.target.value)}
          />
          <div className={styles['checkout__ship-meta']}>
            <div className={styles['checkout__ship-name']}>
              {m.name}{' '}
              <span className={styles['checkout__eta']}>({m.eta})</span>
            </div>
            <div className={styles['checkout__ship-fee']}>{fmtVND(m.fee)}</div>
          </div>
        </label>
      ))}
      <div className={styles['checkout__ship-hint']}>
        * Hỏa tốc chỉ áp dụng nội thành; thời gian có thể thay đổi theo khu vực/khung giờ.
      </div>
    </div>
  );
}
