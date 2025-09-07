import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ProductDetailsPage.module.css';

import Header from '../../components/HomePageItems/Header/Header';
import Footer from '../../components/HomePageItems/Footer/HomePageFooter';
import { useCart } from '../../../context/CartContext';

import { useProductBySlug } from '../../../hooks/useProductBySlug';
import { useProducts } from '../../../hooks/useProducts';
import { usePrice } from '../../../hooks/usePrice';
import { useRelatedProducts } from '../../../hooks/useRelatedProduct';

import Gallery from '../../components/product/Gallery';
import PriceBlock from '../../components/product/PriceBlock';
import FeatureList from '../../components/product/FeatureList';
import GiftList from '../../components/product/GiftList';
import QtySelector from '../../components/product/QtySelector';
import MetaInfo from '../../components/product/MetaInfo';
import Tabs from '../../components/product/Tabs';
import RelatedProducts from '../../components/product/RelatedProducts';

const FILE_BASE = import.meta?.env?.VITE_FILE_BASE_URL || 'http://localhost:4000';
const ensureAbsolute = (u) =>
  !u ? '' : /^https?:|^data:/.test(u) ? u : `${FILE_BASE}${u.startsWith('/') ? '' : '/'}${u}`;

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { prod, images } = useProductBySlug(slug);
  const { products: headerProducts } = useProducts();

  const galleryImages = (images?.length ? images : prod?.images || []).map((i) => ({
    url: ensureAbsolute(i?.url),
    alt: i?.alt || prod?.name || 'Ảnh sản phẩm',
  }));

  const { priceNow, oldPrice, discount } = usePrice(prod);
  const related = useRelatedProducts(prod?.category?.slug, prod?.slug);

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

  const handleAddToCart = (qty, goToCart = false) => {
    const user = localStorage.getItem('user');
    if (!user) return navigate('/login');
    if (prod.stock <= 0) return;

    addToCart(
      {
        _id: prod._id,
        slug: prod.slug,
        name: prod.name,
        sku: prod.sku,
        price: priceNow,
        image: prod.images?.[0]?.url || '',
        stock: prod.stock,
      },
      qty,
    );

    goToCart ? navigate('/cart') : alert('Đã thêm sản phẩm vào giỏ hàng!');
  };

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
              role="button"
              tabIndex={0}
            >
              {prod?.category?.name}
            </span>
            <span>›</span>
            <strong>{prod.name}</strong>
          </div>

          <div className={styles['product-details__head']}>
            {/* Gallery */}
            <Gallery images={galleryImages} discount={discount} />

            {/* Info */}
            <div className={styles['product-details__info']}>
              <h1 className={styles['product-details__title']}>{prod.name}</h1>

              <div className={styles['product-details__sub']}>
                <span><b>Thương hiệu:</b> {prod?.brand?.name}</span>
                <span className={styles['product-details__sep']}>•</span>
                <span><b>Model/SKU:</b> {prod.sku}</span>
              </div>

              <PriceBlock priceNow={priceNow} oldPrice={oldPrice} discount={discount} />
              <FeatureList items={prod.highlights} />
              <GiftList items={prod.gifts} />

              <QtyWithActions
                stock={prod.stock}
                onSubmit={handleAddToCart}
                styles={styles}
              />

              <MetaInfo prod={prod} />
            </div>
          </div>

          <Tabs prod={prod} />
          <RelatedProducts items={related} onGo={(href) => navigate(href)} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function QtyWithActions({ stock, onSubmit, styles }) {
  const [qty, setQty] = useState(1);
  return (
    <div>
      <QtySelector qty={qty} setQty={setQty} stock={stock} />
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
