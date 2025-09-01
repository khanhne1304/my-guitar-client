import styles from '../../pages/CheckoutPage/checkout.module.css';
import { fmtVND } from '../../../utils/currency';
export default function Summary({ subtotal, shipFee, total, onPlace }) {
return (
<div className={styles.summary}>
<div className={styles.sumRow}><span>Tổng tiền hàng</span><b>{fmtVND(subtotal)}</b></div>
<div className={styles.sumRow}><span>Phí vận chuyển</span><b>{fmtVND(shipFee)}</b></div>
<div className={`${styles.sumRow} ${styles.sumTotal}`}><span>Tổng thanh toán</span><b>{fmtVND(total)}</b></div>
<button className={styles.placeBtn} onClick={onPlace}>Đặt hàng</button>
</div>
);
}