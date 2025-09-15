// ProductsView.jsx
import styles from './ProductsPage.module.css';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import CategoryGrid from '../../components/Catalog/CategoryGrid';
import ProductGrid from '../../components/home/ProductGrid';
import { useProductsViewModel } from '../../../viewmodels/ProductsViewModel';

export default function ProductsPage() {
  const { products, categories, handleSelect, isFiltered, q, loading, err } = useProductsViewModel();

  return (
    <div className={styles['products-page']}>
      <Header />

      <main className={styles['products-page__main']}>
        <div className={styles['products-page__container']}>
          {isFiltered ? (
            <>
              <h1 className={styles['products-page__title']}>
                {q ? `Kết quả cho "${q}"` : 'Kết quả lọc sản phẩm'}
              </h1>
              {loading ? (
                <div>Đang tải...</div>
              ) : err ? (
                <div>{err}</div>
              ) : (
                <ProductGrid items={products} emptyText="Không tìm thấy sản phẩm phù hợp." />
              )}
            </>
          ) : (
            <>
              <h1 className={styles['products-page__title']}>Tất cả sản phẩm</h1>
              {loading ? (
                <div>Đang tải...</div>
              ) : err ? (
                <div>{err}</div>
              ) : (
                <ProductGrid items={products} emptyText="Hiện chưa có sản phẩm." />
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
