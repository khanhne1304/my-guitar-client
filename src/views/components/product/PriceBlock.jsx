import styles from '../../pages/productDetails/productDetails.module.css';
import { fmtVND } from '../../../untils/currency';


export default function PriceBlock({ priceNow, oldPrice, discount }) {
return (
<div className={styles.prices}>
<span className={styles.price}>{fmtVND(priceNow)}</span>
{oldPrice ? <span className={styles.old}>{fmtVND(oldPrice)}</span> : null}
{discount ? <span className={styles.badge}>Tiết kiệm {discount}%</span> : null}
</div>
);
}