import styles from '../../pages/CategoryPage/CategoryPage.module.css';
import ProductCard from '../productCard/productCard';

export default function CategoryGrid({ items = [] }) {
  if (!items?.length) {
    return (
      <div className={styles['category__empty']}>
        Chưa có sản phẩm trong danh mục này
      </div>
    );
  }
  return (
    <div className={styles['category__grid']}>
      {items.map((p) => (
        <ProductCard
          key={p._id || p.id}
          {...p}
          href={`/products/${p.slug}`}
          onView={() => console.log('Xem sản phẩm:', p.name)}
        />
      ))}
    </div>
  );
}
