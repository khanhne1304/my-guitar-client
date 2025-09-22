// src/views/pages/ProductDetailsPage/ProductDetailsPage.jsx
import { useState } from 'react';
import styles from './ProductDetailsPage.module.css';

import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import Gallery from '../../components/product/Gallery';
import PriceBlock from '../../components/product/PriceBlock';
import FeatureList from '../../components/product/FeatureList';
import GiftList from '../../components/product/GiftList';
import QtySelector from '../../components/product/QtySelector';
import MetaInfo from '../../components/product/MetaInfo';
import Tabs from '../../components/product/Tabs';
import RelatedProducts from '../../components/product/RelatedProducts';

import { useProductDetailsViewModel } from '../../../viewmodels/ProductDetailsViewModel';
import { useFavorites } from '../../../context/FavoritesContext';
import { getUser } from '../../../utils/storage';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function ProductDetailsPage() {
  const {
    prod,
    headerProducts,
    loadingRelated,
    galleryImages,
    priceNow,
    oldPrice,
    discount,
    related,
    handleAddToCart,
    navigate,
  } = useProductDetailsViewModel();

  const { toggleFavorite, isFavorite } = useFavorites();
  const navigateRouter = useNavigate();
  const user = getUser();

  const handleFavoriteClick = () => {
    if (!user) {
      navigateRouter(`/login?redirect=/products/${prod?.slug}`);
      return;
    }
    toggleFavorite({ ...prod, id: prod._id });
  };

  if (!prod) {
    return (
      <div className={styles['product-details__state']}>
        Không tìm thấy sản phẩm.
        <button
          className={styles['product-details__btn']}
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
      </div>
    );
  }

  const favorited = isFavorite(prod._id);

  return (
    <div className={styles['product-details']}>
      <Header products={headerProducts} />

      <main className={styles['product-details__main']}>
        <div className={styles['product-details__wrap']}>

          {/* breadcrumb */}
          <div className={styles['product-details__breadcrumb']}>
            <span onClick={() => navigate('/')} role="button" tabIndex={0}>Trang chủ</span>
            <span>›</span>
            <span
              onClick={() => navigate(`/category/${prod?.category?.slug}`)}
              role="button" tabIndex={0}
            >
              {prod?.category?.name}
            </span>
            <span>›</span>
            <strong>{prod.name}</strong>
          </div>

          <div className={styles['product-details__head']}>
            <Gallery images={galleryImages} discount={discount} />

            <div className={styles['product-details__info']}>
              {/* Tiêu đề */}
              <h1 className={styles['product-details__title']}>{prod.name}</h1>

              {/* Thương hiệu + SKU */}
              <div className={styles['product-details__sub']}>
                <span><b>Thương hiệu:</b> {prod?.brand?.name}</span>
                <span className={styles['product-details__sep']}>•</span>
                <span><b>Model/SKU:</b> {prod.sku}</span>
              </div>

              {/* Nút thêm yêu thích */}
              <div className={styles['product-details__fav-container']}>
                <button
                  className={`${styles['product-details__fav-btn']} ${favorited ? styles['active'] : ''}`}
                  onClick={handleFavoriteClick}
                  aria-label="Yêu thích"
                >
                  {favorited ? (
                    <FaHeart className={styles['product-details__fav-icon']} />
                  ) : (
                    <FaRegHeart className={styles['product-details__fav-icon']} />
                  )}
                </button>
                <span className={styles['product-details__fav-text']}>
                  {favorited ? "Đã thêm vào danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                </span>
              </div>

              <PriceBlock priceNow={priceNow} oldPrice={oldPrice} discount={discount} />

              <FeatureList
                classNameBox={styles['product-details__box']}
                classNameTitle={styles['product-details__box-title']}
                classNameList={styles['product-details__list']}
                classNameItem={styles['product-details__list-item']}
                items={prod.highlights}
              />

              <GiftList
                classNameBox={styles['product-details__box']}
                classNameTitle={styles['product-details__box-title']}
                classNameList={styles['product-details__list']}
                classNameItem={styles['product-details__list-item']}
                items={prod.gifts}
              />

              <QtyWithActions stock={prod.stock} onSubmit={handleAddToCart} />

              <MetaInfo
                classNameMeta={styles['product-details__meta']}
                prod={prod}
              />
            </div>
          </div>

          <Tabs
            classNameTabs={styles['product-details__tabs']}
            classNameTab={styles['product-details__tab']}
            classNameTabActive={styles['product-details__tab--active']}
            classNamePanel={styles['product-details__tab-panel']}
            prod={prod}
          />

          <RelatedProducts
            classNameWrap={styles['product-details__related']}
            classNameTitle={styles['product-details__related-title']}
            classNameGrid={styles['product-details__related-grid']}
            onGo={(href) => navigate(href)}
            items={related}
          />

          {loadingRelated && <p>Đang tải sản phẩm liên quan...</p>}

        </div>
      </main>

      <Footer />
    </div>
  );
}

function QtyWithActions({ stock, onSubmit }) {
  const [qty, setQty] = useState(1);
  return (
    <div>
      <QtySelector
        classNameRow={styles['product-details__qty']}
        classNameBox={styles['product-details__qty-box']}
        classNameBtn={styles['product-details__qty-btn']}
        classNameInput={styles['product-details__qty-input']}
        stockNoteClass={styles['product-details__stock-note']}
        qty={qty}
        setQty={setQty}
        stock={stock}
      />

      <div className={styles['product-details__actions']}>
        {stock > 0 ? (
          <>
            <button
              className={`${styles['product-details__btn']} ${styles['product-details__btn--primary']}`}
              onClick={() => onSubmit(qty, true)}
            >
              Mua ngay
            </button>
            <button
              className={styles['product-details__btn']}
              onClick={() => onSubmit(qty, false)}
            >
              Thêm vào giỏ
            </button>
          </>
        ) : (
          <button className={styles['product-details__btn']} disabled>
            Hết hàng
          </button>
        )}
      </div>
    </div>
  );
}
