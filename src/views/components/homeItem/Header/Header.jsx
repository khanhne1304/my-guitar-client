// src/components/HomePageItems/Header/Header.jsx
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import { useHeaderViewModel } from "../../../../viewmodels/HeaderViewModel";

export default function Header({ products = [] }) {
  const { state, actions } = useHeaderViewModel(products);

  const {
    user,
    cartCount,
    keyword,
    guitarBrands,
    pianoBrands,
  } = state;

  const {
    setKeyword,
    submitSearch,
    onSearchKeyDown,
    goHome,
    goCart,
    goLogin,
    goRegister,
    goAccount,
    handleLogout,
  } = actions;

  return (
    <header className={styles.home__navbar}>
      <div className={styles.home__logo} onClick={goHome}>
        🎸 MyMusic
      </div>

      {/* MENU */}
      <nav className={styles.home__menu}>
        <div className={styles.home__menuItem}>
          <Link to="/products?category=guitar">Guitar</Link>
          <div className={styles.home__submenu}>
            {guitarBrands.length ? (
              guitarBrands.map((b) => (
                <Link
                  key={`g-${b}`}
                  to={`/products?category=guitar&brand=${encodeURIComponent(b)}`}
                >
                  {b}
                </Link>
              ))
            ) : (
              <span className={styles.home__submenuEmpty}>
                Chưa có thương hiệu
              </span>
            )}
          </div>
        </div>

        <div className={styles.home__menuItem}>
          <Link to="/products?category=piano">Piano</Link>
          <div className={styles.home__submenu}>
            {pianoBrands.length ? (
              pianoBrands.map((b) => (
                <Link
                  key={`p-${b}`}
                  to={`/products?category=piano&brand=${encodeURIComponent(b)}`}
                >
                  {b}
                </Link>
              ))
            ) : (
              <span className={styles.home__submenuEmpty}>
                Chưa có thương hiệu
              </span>
            )}
          </div>
        </div>

        <div className={styles.home__menuItem}>
          <Link to="/">Khóa học</Link>
        </div>

        <div className={styles.home__menuItem}>
          <Link to="/">Công cụ</Link>
          <div className={styles.home__submenu}>
            <Link to="/tools/metronome">MÁY ĐẾM NHỊP</Link>
            <Link to="/tools/chords">TRA CỨU HỢP ÂM</Link>
            <Link to="/tools/tuner">CHỈNH DÂY ĐÀN GUITAR</Link>
          </div>
        </div>
      </nav>

      {/* SEARCH */}
      <div className={styles.home__searchBox}>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={onSearchKeyDown}
        />
        <button onClick={submitSearch}>Tìm</button>
      </div>

      {/* AUTH */}
      <div className={styles.home__authButtons}>
        {user ? (
          <div className={styles.home__userWrap}>
            {/* Giỏ hàng */}
            <button
              className={styles.iconBtn}
              onClick={goCart}
              aria-label="Giỏ hàng"
            >
              <span className={styles.cartIcon}>🛒</span>
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </button>

            {/* Tài khoản */}
            <div className={styles.accountMenu}>
              <button className={styles.iconBtn} aria-label="Tài khoản">
                👤
              </button>
              <div className={styles.accountDropdown}>
                <span className={styles.home__userText}>
                  {user.name || user.email}
                </span>
                <button className={styles.dropdownBtn} onClick={goAccount}>
                  Cài đặt tài khoản của tôi
                </button>
                <button className={styles.dropdownBtn} onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <button className={styles.home__btn} onClick={goLogin}>
              Đăng nhập
            </button>
            <button
              className={`${styles.home__btn} ${styles["home__btn--primary"]}`}
              onClick={goRegister}
            >
              Đăng ký
            </button>
          </>
        )}
      </div>
    </header>
  );
}
