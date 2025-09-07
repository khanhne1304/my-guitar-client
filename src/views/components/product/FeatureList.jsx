// src/components/product/FeatureList.jsx
import styles from '../../pages/ProductDetailsPage/ProductDetailsPage.module.css';

export default function FeatureList({ items = [] }) {
  if (!items?.length) return null;
  return (
    <div className={styles['product-details__box']}>
      <h4 className={styles['product-details__box-title']}>🌟 Đặc điểm nổi bật</h4>
      <ul className={styles['product-details__list']}>
        {items.map((h, i) => (
          <li key={i} className={styles['product-details__list-item']}>
            {h}
          </li>
        ))}
      </ul>
    </div>
  );
}
