import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FavoritesPage.module.css';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import ProductCard from '../../components/productCard/productCard';
import { useFavorites } from '../../../context/FavoritesContext';
import { useProducts } from '../../../hooks/useProducts';

export default function FavoritesPage() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const { headerProducts } = useProducts();
  const navigate = useNavigate();

  const handleRemoveFromFavorites = (productId) => {
    removeFromFavorites(productId);
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm yêu thích?')) {
      clearFavorites();
    }
  };

  const handleViewProduct = (product) => {
    if (product.slug) {
      navigate(`/products/${product.slug}`);
    }
  };

  return (
    <div className={styles.favoritesPage}>
      <Header products={headerProducts} />

      <main className={styles.favoritesPage__main}>
        <div className={styles.favoritesPage__container}>
          <div className={styles.favoritesPage__header}>
            <h1 className={styles.favoritesPage__title}>
              Sản phẩm yêu thích
            </h1>
            <p className={styles.favoritesPage__subtitle}>
              {favorites.length} sản phẩm trong danh sách yêu thích
            </p>
          </div>

          {favorites.length > 0 ? (
            <>
              <div className={styles.favoritesPage__actions}>
                <button
                  className={styles.favoritesPage__clearBtn}
                  onClick={handleClearAll}
                >
                  Xóa tất cả
                </button>
              </div>

              <div className={styles.favoritesPage__grid}>
                {favorites.map((product) => (
                  <div key={product.id} className={styles.favoritesPage__item}>
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      brand={product.brand}
                      model={product.model}
                      price={product.price}
                      oldPrice={product.oldPrice}
                      image={product.image}   // giờ chắc chắn có ảnh
                      slug={product.slug}
                      onView={() => handleViewProduct(product)}
                    />

                    <button
                      className={styles.favoritesPage__removeBtn}
                      onClick={() => handleRemoveFromFavorites(product.id)}
                      title="Xóa khỏi danh sách yêu thích"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.favoritesPage__empty}>
              <div className={styles.favoritesPage__emptyIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h2 className={styles.favoritesPage__emptyTitle}>
                Chưa có sản phẩm yêu thích
              </h2>
              <p className={styles.favoritesPage__emptyText}>
                Hãy khám phá các sản phẩm và thêm vào danh sách yêu thích của bạn
              </p>
              <button
                className={styles.favoritesPage__emptyBtn}
                onClick={() => navigate('/')}
              >
                Khám phá sản phẩm
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
