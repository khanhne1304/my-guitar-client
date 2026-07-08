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
import ChatbotWidget from "../../components/chat/ChatbotWidget";
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

          <div className={styles['product-details__head']}>
            <Gallery images={galleryImages} discount={discount} />

            <div className={styles['product-details__info']}>
              {/* Tiêu đề */}
              <h1 className={styles['product-details__title']}>{prod.name}</h1>

              {/* Thương hiệu + Model */}
              <div className={styles['product-details__sub']}>
                {prod?.brand?.name && (
                  <span className={styles['product-details__chip']}>
                    <span className={styles['product-details__chip-label']}>Thương hiệu</span>
                    <span className={styles['product-details__chip-value']}>{prod.brand.name}</span>
                  </span>
                )}
                {prod?.sku && (
                  <span className={`${styles['product-details__chip']} ${styles['product-details__chip--model']}`}>
                    <span className={styles['product-details__chip-label']}>Model</span>
                    <span className={styles['product-details__chip-value']}>{prod.sku}</span>
                  </span>
                )}
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

              <QtyWithActions
                stock={prod.stock}
                onSubmit={handleAddToCart}
                favorited={favorited}
                onToggleFavorite={handleFavoriteClick}
              />

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
            onGo={(href) => {
              window.scrollTo(0, 0);
              navigate(href);
            }}
            items={related}
          />

          {loadingRelated && <p>Đang tải sản phẩm liên quan...</p>}

        </div>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}

function QtyWithActions({ stock, onSubmit, favorited, onToggleFavorite }) {
  const [qty, setQty] = useState(1);

  const favButton = (
    <button
      type="button"
      className={`${styles['product-details__fav-btn']} ${favorited ? styles['active'] : ''}`}
      onClick={onToggleFavorite}
      aria-label={favorited ? 'Bỏ khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
      title={favorited ? 'Đã thêm vào danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
    >
      {favorited ? (
        <FaHeart className={styles['product-details__fav-icon']} />
      ) : (
        <FaRegHeart className={styles['product-details__fav-icon']} />
      )}
    </button>
  );

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
            {favButton}
          </>
        ) : (
          <>
            <button className={styles['product-details__btn']} disabled>
              Hết hàng
            </button>
            {favButton}
          </>
        )}
      </div>
    </div>
  );
}
