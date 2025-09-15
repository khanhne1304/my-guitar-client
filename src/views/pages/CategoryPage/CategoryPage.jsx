// CategoryView.jsx
import styles from './CategoryPage.module.css';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';

import Breadcrumb from '../../components/Category/Breadcrumb';
import Toolbar from '../../components/Category/Toolbar';
import CategoryGrid from '../../components/Category/CategoryGrid';

import { useCategoryViewModel } from '../../../viewmodels/CategoryViewModel';

export default function CategoryView() {
  const { categorySlug, sortBy, setSortBy, sortedProducts, loading, err } =
    useCategoryViewModel();

  return (
    <div className={styles.category}>
      <Header />

      <main className={styles['category__main']}>
        <div className={styles['category__wrap']}>
          <Breadcrumb
            categorySlug={categorySlug}
            className={styles['category__breadcrumb']}
            currentClassName={styles['category__breadcrumb-current']}
          />

          <h1 className={styles['category__title']}>
            Danh mục: {categorySlug?.toUpperCase()}
          </h1>

          <Toolbar
            sortBy={sortBy}
            onSortChange={setSortBy}
            className={styles['category__filters']}
            sortClassName={styles['category__sort']}
            selectClassName={styles['category__sort-select']}
            filterBtnClassName={styles['category__filter-btn']}
          />

          {loading && <div>Đang tải...</div>}
          {err && <div className={styles['category__error']}>{err}</div>}
          {!loading && !err && (
            <CategoryGrid
              items={sortedProducts}
              className={styles['category__grid']}
              emptyClassName={styles['category__empty']}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
