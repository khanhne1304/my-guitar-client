import { useState } from 'react';
import styles from '../../pages/ProductDetailsPage/ProductDetailsPage.module.css';

const PLACEHOLDER = 'https://placehold.co/600x400?text=No+Image';

export default function Gallery({ images = [], discount = 0 }) {
  const [active, setActive] = useState(0);

  const safeImages = (images || []).filter((img) => img && img.url);
  const hasImages = safeImages.length > 0;
  const activeIndex = active < safeImages.length ? active : 0;
  const mainSrc = hasImages ? safeImages[activeIndex].url : PLACEHOLDER;
  const mainAlt = hasImages
    ? safeImages[activeIndex].alt || 'Ảnh sản phẩm'
    : 'Chưa có ảnh';

  const handleError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = PLACEHOLDER;
  };

  return (
    <div className={styles['product-details__gallery']}>
      <div className={styles['product-details__gallery-main']}>
        {discount ? (
          <div className={styles['product-details__gallery-sale']}>-{discount}%</div>
        ) : null}
        <img src={mainSrc} alt={mainAlt} loading="lazy" onError={handleError} />
      </div>

      {hasImages && safeImages.length > 1 ? (
        <div className={styles['product-details__gallery-thumbs']}>
          {safeImages.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              className={`${styles['product-details__gallery-thumb']} ${
                i === activeIndex ? styles['product-details__gallery-thumb--active'] : ''
              }`}
              onClick={() => setActive(i)}
              aria-label={`Ảnh ${i + 1}`}
            >
              <img
                src={img.url}
                alt={img.alt || `thumb-${i}`}
                loading="lazy"
                onError={handleError}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
