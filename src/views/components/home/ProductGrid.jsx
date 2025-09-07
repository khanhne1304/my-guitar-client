// src/components/home/ProductGrid.jsx
import styles from '../../pages/HomePage/HomePage.module.css';
import ProductCard from '../productCard/productCard';

export default function ProductGrid({
  items = [],
  emptyText = 'Không tìm thấy sản phẩm phù hợp.',
}) {
  if (!items?.length) {
    return <div className={styles.home__empty}>{emptyText}</div>;
  }
  return (
    <div className={styles.home__grid}>
      {items.map((p) => (
        <ProductCard
          key={p.id || p._id}
          {...p}
          href={`/products/${p.slug}`}
          onView={() => console.log('Xem sản phẩm:', p.name)}
        />
      ))}
    </div>
  );
}
