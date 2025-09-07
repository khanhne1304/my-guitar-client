import { useState } from 'react';
import styles from '../../pages/ProductDetailsPage/ProductDetailsPage.module.css';

export default function Gallery({ images = [], discount = 0 }) {
  const [active, setActive] = useState(0);

  return (
    <div className={styles['product-details__gallery']}>
      <div className={styles['product-details__gallery-main']}>
        {discount ? (
          <div className={styles['product-details__gallery-sale']}>-{discount}%</div>
        ) : null}
        <img src={images[active]?.url} alt={images[active]?.alt} />
      </div>

      <div className={styles['product-details__gallery-thumbs']}>
        {images.map((img, i) => (
          <button
            key={`${img.url}-${i}`}
            className={`${styles['product-details__gallery-thumb']} ${
              i === active ? styles['product-details__gallery-thumb--active'] : ''
            }`}
            onClick={() => setActive(i)}
            aria-label={`Ảnh ${i + 1}`}
          >
            <img src={img.url} alt={img.alt || `thumb-${i}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
