import React from 'react';
import { Link } from 'react-router-dom';
import styles from './productCard.module.css';

/**
 * ProductCard – hỗ trợ nhiều định dạng ảnh và link chi tiết theo slug
 */
export default function ProductCard({
  image,
  images,
  cover,
  thumbnail,
  name,
  brand,
  model,
  price,
  oldPrice,
  href,
  slug,
  onView,
}) {
  const FILE_BASE =
    import.meta?.env?.VITE_FILE_BASE_URL || 'http://localhost:4000';

  const ensureAbsolute = (u) => {
    if (!u) return '';
    const s = String(u);
    const low = s.toLowerCase();
    if (
      low.startsWith('http://') ||
      low.startsWith('https://') ||
      low.startsWith('data:')
    ) {
      return s;
    }
    return `${FILE_BASE}${s.startsWith('/') ? '' : '/'}${s}`;
  };

  const resolveSrc = () => {
    const candidate =
      image ||
      thumbnail ||
      (Array.isArray(images) && images[0] && images[0].url) ||
      cover ||
      '';
    return ensureAbsolute(candidate);
  };

  const resolveAlt = () => {
    const firstAlt =
      (Array.isArray(images) && images[0] && images[0].alt) || '';
    return firstAlt || name || 'Sản phẩm';
  };

  const toHref = href || (slug ? `/products/${slug}` : undefined);

  const formatVND = (v) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(v);

  const getDisplayPrice = (price) => {
    if (typeof price === 'number') return formatVND(price);
    if (typeof price === 'string') return price;
    if (price && typeof price === 'object') {
      if (price.sale && price.sale !== 0) return formatVND(price.sale);
      if (price.base) return formatVND(price.base);
      return 'Liên hệ';
    }
    return 'Liên hệ';
  };

  const displayPrice = getDisplayPrice(price);

  const ImageTag = (
    <img
      src={resolveSrc()}
      alt={resolveAlt()}
      loading='lazy'
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image';
      }}
    />
  );

  return (
    <article className={styles.productCard}>
      {/* Ảnh */}
      <div className={styles.productCard__media}>
        {toHref ? (
          <Link to={toHref} onClick={onView} aria-label={`Xem thêm ${name}`}>
            {ImageTag}
          </Link>
        ) : (
          ImageTag
        )}
      </div>

      {/* Thông tin */}
      <div className={styles.productCard__footer}>
        <div className={styles.productCard__info}>
          {/* Brand + model */}
          {!!(brand || model) && (
            <div className={styles.productCard__title}>
              {brand?.name?.toUpperCase?.() || brand?.toUpperCase?.()} {model}
            </div>
          )}

          {/* Tên sản phẩm */}
          {name && <div className={styles.productCard__name}>{name}</div>}

          {/* Giá */}
          <div className={styles.productCard__prices}>
            <span className={styles.productCard__price}>{displayPrice}</span>
            {oldPrice ? (
              <span className={styles.productCard__oldPrice}>
                {formatVND(oldPrice)}
              </span>
            ) : null}
          </div>
        </div>

        {/* CTA */}
        {toHref ? (
          <Link
            to={toHref}
            className={styles.productCard__cta}
            onClick={onView}
            aria-label={`Xem thêm ${name}`}
          >
            Xem thêm
          </Link>
        ) : (
          <button
            type='button'
            className={styles.productCard__cta}
            onClick={onView}
            aria-label={`Xem thêm ${name}`}
          >
            Xem thêm
          </button>
        )}
      </div>
    </article>
  );
}
