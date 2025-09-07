import styles from '../../pages/ProductDetailsPage/ProductDetailsPage.module.css';
import { fmtVND } from '../../../utils/currency';

export default function PriceBlock({ priceNow, oldPrice, discount }) {
  return (
    <div className={styles['product-details__prices']}>
      <span className={styles['product-details__price']}>{fmtVND(priceNow)}</span>
      {oldPrice ? (
        <span className={styles['product-details__old']}>{fmtVND(oldPrice)}</span>
      ) : null}
      {discount ? (
        <span className={styles['product-details__badge']}>Tiết kiệm {discount}%</span>
      ) : null}
    </div>
  );
}
