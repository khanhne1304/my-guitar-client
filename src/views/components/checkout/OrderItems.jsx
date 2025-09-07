import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';
import { fmtVND } from '../../../utils/currency';

export default function OrderItems({ items }) {
  return (
    <div className={styles['checkout__cart']}>
      <div className={styles['checkout__cart-title']}>Giỏ hàng</div>
      {items.map((it) => (
        <div key={it._id} className={styles['checkout__cart-row']}>
          <div className={styles['checkout__cart-thumb']}>
            <img src={it.image} alt={it.name} />
          </div>
          <div className={styles['checkout__cart-info']}>
            <div className={styles['checkout__cart-name']}>{it.name}</div>
            <div className={styles['checkout__cart-sku']}>{it.sku}</div>
          </div>
          <div className={styles['checkout__cart-qty']}>x{it.qty}</div>
          <div className={styles['checkout__cart-price']}>{fmtVND(it.price)}</div>
        </div>
      ))}
    </div>
  );
}
