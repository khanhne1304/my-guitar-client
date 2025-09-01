import styles from '../../pages/CheckoutPage/checkout.module.css';
import { fmtVND } from '../../../utils/currency';
export default function OrderItems({ items }) {
return (
<div className={styles.cartBox}>
<div className={styles.cartTitle}>Giỏ hàng</div>
{items.map((it) => (
<div key={it._id} className={styles.cartRow}>
<div className={styles.thumb}><img src={it.image} alt={it.name} /></div>
<div className={styles.cinfo}>
<div className={styles.cname}>{it.name}</div>
<div className={styles.csku}>{it.sku}</div>
</div>
<div className={styles.cqty}>x{it.qty}</div>
<div className={styles.cprice}>{fmtVND(it.price)}</div>
</div>
))}
</div>
);
}