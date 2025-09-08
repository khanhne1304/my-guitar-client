// ProductDetailsView.jsx
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
export default function ProductDetailsPage() {
  const {
    prod,
    headerProducts,
    galleryImages,
    priceNow,
    oldPrice,
    discount,
    related,
    handleAddToCart,
    navigate,
  } = useProductDetailsViewModel();

  if (!prod) {
    return (
      <div className={styles['product-details__state']}>
        Không tìm thấy sản phẩm.
        <button className={styles['product-details__btn']} onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

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
              <h1 className={styles['product-details__title']}>{prod.name}</h1>

              <div className={styles['product-details__sub']}>
                <span><b>Thương hiệu:</b> {prod?.brand?.name}</span>
                <span className={styles['product-details__sep']}>•</span>
                <span><b>Model/SKU:</b> {prod.sku}</span>
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
