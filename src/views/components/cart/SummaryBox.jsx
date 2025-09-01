import styles from '../../../views/pages/CartPage/cart.module.css';
import { fmtVND } from '../../../untils/currency';


export default function SummaryBox({ subtotal, agree, setAgree, onCheckout }) {
return (
<div>
<h3 className={styles.boxTitle}>Thông tin đơn hàng</h3>


<div className={styles.totalRow}>
<span>Tổng tiền:</span>
<b className={styles.total}>{fmtVND(subtotal)}</b>
</div>


<ul className={styles.notes}>
<li>Phí vận chuyển sẽ được tính ở trang thanh toán.</li>
<li>Bạn cũng có thể nhập mã giảm giá ở trang thanh toán.</li>
</ul>


<label className={styles.agree}>
<input type='checkbox' checked={agree} onChange={(e) => setAgree(e.target.checked)} />
<span>Tôi đã đọc và đồng ý với các điều khoản của đơn vị.</span>
</label>


<button className={styles.btnCheckout} disabled={!agree} onClick={onCheckout}>
THANH TOÁN
</button>
</div>
);
}