import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';
import { fmtVND } from '../../../utils/currency';
export default function ShipMethods({ visible, methods, shipMethod, setShipMethod }) {
if (!visible) return <div className={styles.shipPlaceholder}>Bạn đã chọn <b>nhận tại cửa hàng</b>. Phí vận chuyển = 0đ.</div>;
return (
<div className={styles.shipMethods}>
{methods.map((m) => (
<label key={m.id} className={styles.shipMethod}>
<input type='radio' name='ship-method' value={m.id} checked={shipMethod===m.id} onChange={(e)=>setShipMethod(e.target.value)}/>
<div className={styles.shipMeta}>
<div className={styles.shipName}>{m.name} <span className={styles.eta}>({m.eta})</span></div>
<div className={styles.shipFee}>{fmtVND(m.fee)}</div>
</div>
</label>
))}
<div className={styles.shipHint}>* Hỏa tốc chỉ áp dụng nội thành; thời gian có thể thay đổi theo khu vực/khung giờ.</div>
</div>
);
}