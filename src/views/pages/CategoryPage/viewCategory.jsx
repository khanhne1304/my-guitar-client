// src/pages/Category.jsx
import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import styles from './Category.module.css';

import Header from '../../components/HomePageItems/Header/Header';
import Footer from '../../components/HomePageItems/Footer/HomePageFooter';
import { MOCK_PRODUCTS } from '../../components/Data/dataProduct';

import { useCategoryProducts } from '../../../hooks/useCategoryProducts';
import Breadcrumb from '../../components/Category/Breadcrumb';
import Toolbar from '../../components/Category/Toolbar';
import CategoryGrid from '../../components/Category/CategoryGrid';

export default function Category() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('default');

  const categorySlug = slug || searchParams.get('category');
  const { products, loading, err } = useCategoryProducts(categorySlug);

  const sortedProducts = useMemo(() => {
    const list = [...(products || [])];
    const getNow = (p) =>
      p?.price?.sale && p.price.sale !== 0 ? p.price.sale : p?.price?.base || 0;

    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => getNow(a) - getNow(b));
      case 'price-desc':
        return list.sort((a, b) => getNow(b) - getNow(a));
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return list.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return list;
    }
  }, [products, sortBy]);

  return (
    <div className={styles.categoryPage}>
      <Header products={MOCK_PRODUCTS} />

      <main className={styles.categoryMain}>
        <div className={styles.categoryWrap}>
          <Breadcrumb categorySlug={categorySlug} />

          <h1 className={styles.title}>
            Danh mục: {categorySlug?.toUpperCase()}
          </h1>

          <Toolbar sortBy={sortBy} onSortChange={setSortBy} />

          {loading && <div>Đang tải...</div>}
          {err && <div className={styles.error}>{err}</div>}
          {!loading && !err && <CategoryGrid items={sortedProducts} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
