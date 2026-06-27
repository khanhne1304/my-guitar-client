import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { useCategory } from "../../../../context/CategoryContext";
import { useAuth } from "../../../../context/AuthContext";

export default function Menu({ brands, loading, loadBrandsFor }) {
  const { selectCategory, selectBrand } = useCategory();
  const navigate = useNavigate();
  const { user } = useAuth();

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
      <div className={styles.home__menuItem}>
        <Link to="/">Luyện tập</Link>
        <div className={styles.home__submenu}>
          <Link to="/learn">KHÓA HỌC</Link>
          <Link to="/tools/chord-practice">LUYỆN TẬP HỢP ÂM</Link>
          <Link to="/tools/finger-practice">LUYỆN TẬP NGÓN TAY</Link>
          <Link to="/tools/ai-guitar-practice">LUYỆN TẬP GUITAR VỚI AI</Link>
        </div>
      </div>
      <div className={styles.home__menuItem}>
        <Link to="/">Công cụ</Link>
        <div className={styles.home__submenu}>
          <Link to="/tools/metronome">MÁY ĐẾM NHỊP</Link>
          <Link to="/tools/chords">TRA CỨU HỢP ÂM</Link>
          <Link to="/tools/tuner">CHỈNH DÂY</Link>
          <Link to="/song-search">HỢP ÂM CHUẨN</Link>
        </div>
      </div>
      <div className={styles.home__menuItem}>
        <Link to="/song-search">Bài hát</Link>
      </div>
      <div className={styles.home__menuItem}>
        <Link to="/forum">Diễn đàn</Link>
      </div>
      {user && (
        <div className={styles.home__menuItem}>
          <Link to="/creator">Tạo khóa học</Link>
        </div>
      )}
        <div className={styles.home__menuItem}>
        <Link to="/policies">Chính sách</Link>
        <div className={styles.home__submenu}>
          <Link to="/shipping-returns">GIAO HÀNG - ĐỔI TRẢ</Link>
          <Link to="/how-to-buy">HƯỚNG DẪN MUA HÀNG</Link>
          <Link to="/payment-security">THANH TOÁN &amp; BẢO MẬT</Link>
          <Link to="/warranty-policy">CHÍNH SÁCH BẢO HÀNH</Link>
          <Link to="/warranty">TRA CỨU - KÍCH HOẠT BẢO HÀNH</Link>
          <Link to="/privacy-policy">QUYỀN RIÊNG TƯ</Link>
        </div>
      </div>
    </nav>
  );
}
