// src/pages/ProductDetails.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './productDetails.module.css';

import Header from '../../components/HomePageItems/Header/Header';
import Footer from '../../components/HomePageItems/Footer/HomePageFooter';
import { MOCK_PRODUCTS } from '../../components/Data/dataProduct';
import { useCart } from '../../../context/CartContext';

import { useProductBySlug } from '../../../hooks/useProductBySlug';
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

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { prod, images } = useProductBySlug(slug);
  const { priceNow, oldPrice, discount } = usePrice(prod);
  const related = useRelatedProducts(prod?.category?.slug, prod?.slug);

  if (!prod) {
    return (
      <div className={styles.state}>
        Không tìm thấy sản phẩm.
        <button className={styles.btn} onClick={() => navigate(-1)}>
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
      qty
    );

    if (goToCart) {
      navigate('/cart');
    } else {
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    }
  };

  return (
    <div className={styles.page}>
      <Header products={MOCK_PRODUCTS} />

      <main className={styles.main}>
        <div className={styles.wrap}>
          {/* breadcrumb */}
          <div className={styles.breadcrumb}>
            <span onClick={() => navigate('/')} role="button" tabIndex={0}>
              Trang chủ
            </span>
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

          <div className={styles.head}>
            {/* GALLERY */}
            <Gallery images={images} discount={discount} />

            {/* INFO */}
            <div className={styles.info}>
              <h1 className={styles.title}>{prod.name}</h1>

              <div className={styles.sub}>
                <span>
                  <b>Thương hiệu:</b> {prod?.brand?.name}
                </span>
                <span className={styles.sep}>•</span>
                <span>
                  <b>Model/SKU:</b> {prod.sku}
                </span>
              </div>

              <PriceBlock priceNow={priceNow} oldPrice={oldPrice} discount={discount} />

              <FeatureList items={prod.highlights} />
              <GiftList items={prod.gifts} />

              {/* Qty + Actions */}
              <QtyWithActions stock={prod.stock} onSubmit={handleAddToCart} />

              <MetaInfo prod={prod} />
            </div>
          </div>

          {/* TABS */}
          <Tabs prod={prod} />

          {/* Related products */}
          <RelatedProducts items={related} onGo={(href) => navigate(href)} />
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
      <QtySelector qty={qty} setQty={setQty} stock={stock} />
      <div className={styles.actions}>
        {stock > 0 ? (
          <>
            <button
              className={`${styles.btn} ${styles.primary}`}
              onClick={() => onSubmit(qty, true)}
            >
              Mua ngay
            </button>
            <button className={styles.btn} onClick={() => onSubmit(qty, false)}>
              Thêm vào giỏ
            </button>
          </>
        ) : (
          <button className={styles.btn} disabled>
            Hết hàng
          </button>
        )}
      </div>
    </div>
  );
}
