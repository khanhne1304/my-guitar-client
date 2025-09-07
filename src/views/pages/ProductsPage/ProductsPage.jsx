// src/pages/Products.jsx
import { useNavigate } from 'react-router-dom';
import styles from './ProductsPage.module.css';

import Header from '../../components/HomePageItems/Header/Header';
import Footer from '../../components/HomePageItems/Footer/HomePageFooter';
import { MOCK_PRODUCTS } from '../../components/Data/dataProduct';

import { useCategoriesFromProducts } from '../../../hooks/useCategoriesFromProducts';
import CategoryGrid from '../../components/catalog/CategoryGrid';

export default function Products() {
  const navigate = useNavigate();
  const categories = useCategoriesFromProducts(MOCK_PRODUCTS);

  const handleSelect = (slug) => {
    navigate(`/products?category=${encodeURIComponent(slug)}`);
  };

  return (
    <div className={styles['products-page']}>
      <Header products={MOCK_PRODUCTS} />

      <main className={styles['products-page__main']}>
        <div className={styles['products-page__container']}>
          <h1 className={styles['products-page__title']}>
            Danh mục sản phẩm
          </h1>
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
