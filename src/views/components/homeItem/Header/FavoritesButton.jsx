import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../../../context/FavoritesContext';
import styles from './Header.module.css';

export default function FavoritesButton() {
  const navigate = useNavigate();
  const { favoritesCount } = useFavorites();

  const handleClick = () => {
    navigate('/favorites');
  };

  return (
    <button
      className={styles.home__favoritesBtn}
      onClick={handleClick}
      aria-label="Sản phẩm yêu thích"
      title="Sản phẩm yêu thích"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {favoritesCount > 0 && (
        <span className={styles.home__favoritesCount}>
          {favoritesCount}
        </span>
      )}
    </button>
  );
}
