// ProductsView.jsx
import styles from './ProductsPage.module.css';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import CategoryGrid from '../../components/Catalog/CategoryGrid';
import { useProductsViewModel } from '../../../viewmodels/ProductsViewModel';

export default function ProductsPage() {
  const { products, categories, handleSelect } = useProductsViewModel();

  return (
    <div className={styles['products-page']}>
      <Header />

      <main className={styles['products-page__main']}>
        <div className={styles['products-page__container']}>
          <h1 className={styles['products-page__title']}>Danh mục sản phẩm</h1>
          <CategoryGrid
            categories={categories}
            onSelect={handleSelect}
            className={styles['products-page__grid']}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
