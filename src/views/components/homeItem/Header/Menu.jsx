import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { useCategory } from "../../../../context/CategoryContext";

export default function Menu({ brands, loading, loadBrandsFor }) {
  const { selectCategory, selectBrand } = useCategory();
  const navigate = useNavigate();

  const handleCategoryClick = (categorySlug) => {
    selectCategory(categorySlug);
    navigate(`/products?category=${encodeURIComponent(categorySlug)}`);
  };

  const handleBrandClick = (categorySlug, brandSlug) => {
    selectCategory(categorySlug);
    selectBrand(brandSlug);
    const params = new URLSearchParams({
      category: categorySlug,
      brand: brandSlug,
    });
    navigate(`/products?${params.toString()}`);
  };

  const renderSubmenu = (slug, list, isLoading) => (
    <div className={styles.home__submenu}>
      {list?.length ? (
        list.map((b) => (
          <button
            key={`${slug}-${b.slug}`}
            className={styles.home__submenuItem}
            onClick={() => handleBrandClick(slug, b.slug)}
          >
            {b.name}
          </button>
        ))
      ) : isLoading ? (
        <span className={styles.home__submenuEmpty}>Đang tải…</span>
      ) : (
        <span className={styles.home__submenuEmpty}>Chưa có thương hiệu</span>
      )}
    </div>
  );

  return (
    <nav className={styles.home__menu}>
      <div
        className={styles.home__menuItem}
        onMouseEnter={() => loadBrandsFor("guitar")}
      >
        <button 
          className={styles.home__menuLink}
          onClick={() => handleCategoryClick("guitar")}
        >
          Guitar
        </button>
        {renderSubmenu("guitar", brands.guitar, loading.guitar)}
      </div>
      <div
        className={styles.home__menuItem}
        onMouseEnter={() => loadBrandsFor("piano")}
      >
        <button 
          className={styles.home__menuLink}
          onClick={() => handleCategoryClick("piano")}
        >
          Piano
        </button>
        {renderSubmenu("piano", brands.piano, loading.piano)}
      </div>
      <div className={styles.home__menuItem}>
        <Link to="/courses">Khóa học</Link>
      </div>
      <div className={styles.home__menuItem}>
        <Link to="/">Công cụ</Link>
        <div className={styles.home__submenu}>
          <Link to="/tools/metronome">MÁY ĐẾM NHỊP</Link>
          <Link to="/tools/chords">TRA CỨU HỢP ÂM</Link>
          <Link to="/tools/tuner">CHỈNH DÂY</Link>
        </div>
      </div>
      <div className={styles.home__menuItem}>
        <Link to="/songs">Bài hát</Link>
      </div>
    </nav>
  );
}
