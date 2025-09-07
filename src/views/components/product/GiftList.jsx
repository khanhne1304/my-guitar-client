import styles from '../../pages/ProductDetailsPage/ProductDetailsPage.module.css';

export default function GiftList({ items = [] }) {
  if (!items?.length) return null;
  return (
    <div className={styles['product-details__box']}>
      <h4 className={styles['product-details__box-title']}>🎁 Quà tặng kèm</h4>
      <ul className={styles['product-details__list']}>
        {items.map((g, i) => (
          <li key={i} className={styles['product-details__list-item']}>
            {g}
          </li>
        ))}
      </ul>
    </div>
  );
}
