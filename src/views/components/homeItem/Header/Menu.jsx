import { Link } from "react-router-dom";
import styles from "./Header.module.css";

export default function Menu({ brands, loading, loadBrandsFor }) {
  const renderSubmenu = (slug, list, isLoading) => (
    <div className={styles.home__submenu}>
      {list?.length ? (
        list.map((b) => (
          <Link
            key={`${slug}-${b.slug}`}
            to={`/products?category=${slug}&brand=${encodeURIComponent(b.slug)}`}
          >
            {b.name}
          </Link>
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
        <Link to="/products?category=guitar">Guitar</Link>
        {renderSubmenu("guitar", brands.guitar, loading.guitar)}
      </div>
      <div
        className={styles.home__menuItem}
        onMouseEnter={() => loadBrandsFor("piano")}
      >
        <Link to="/products?category=piano">Piano</Link>
        {renderSubmenu("piano", brands.piano, loading.piano)}
      </div>
      <div className={styles.home__menuItem}>
        <Link to="/">Khóa học</Link>
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
