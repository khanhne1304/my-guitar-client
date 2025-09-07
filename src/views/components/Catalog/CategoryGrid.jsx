// src/components/catalog/CategoryGrid.jsx
import styles from '../../pages/ProductsPage/ProductsPage.module.css';
import CategoryCard from './CategoryCard';

export default function CategoryGrid({ categories, onSelect }) {
  return (
    <div className={styles['products-page__grid']}>
      {categories.map((c) => (
        <CategoryCard key={c.slug} item={c} onClick={onSelect} />
      ))}
    </div>
  );
}
