// src/components/catalog/CategoryCard.jsx
import styles from '../../pages/ProductsPage/ProductsPage.module.css';

export default function CategoryCard({ item, onClick }) {
  const { slug, name, cover, count } = item;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(slug);
    }
  };

  return (
    <article
      className={styles['products-card']}
      onClick={() => onClick?.(slug)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${name} (${count})`}
    >
      <img
        className={styles['products-card__bg']}
        src={cover}
        alt={name}
        loading="lazy"
      />
      <div className={styles['products-card__overlay']} />
      <div className={styles['products-card__label']}>
        <span className={styles['products-card__arrow']}>»</span> {name}
        <span className={styles['products-card__count']}>({count})</span>
      </div>
    </article>
  );
}
