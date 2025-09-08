import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import styles from "./Header.module.css";
import { useCart } from "../../../../context/CartContext";

export default function Header({ products = [] }) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // User state
    const [user, setUser] = useState(null);
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem("user");
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    };

    // Brand theo category
    const brandsByCategory = useMemo(() => {
        return products.reduce((acc, p) => {
            const cat = (p.category?.slug || p.category?.name || "").toLowerCase();
            const brand = (p.brand?.name || "").toUpperCase();
            if (!cat || !brand) return acc;
            acc[cat] ??= new Set();
            acc[cat].add(brand);
            return acc;
        }, {});
    }, [products]);

    const guitarBrands = Array.from(brandsByCategory?.guitar ?? []);
    const pianoBrands = Array.from(brandsByCategory?.piano ?? []);

    // Search state
    const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
    const [categoryFilter, setCategoryFilter] = useState(
        searchParams.get("category") ?? ""
    );
    const [brandFilter, setBrandFilter] = useState(
        searchParams.get("brand") ?? ""
    );

    const submitSearch = () => {
        const params = new URLSearchParams();
        if (keyword.trim()) params.set("q", keyword.trim());
        if (categoryFilter) params.set("category", categoryFilter);
        if (brandFilter) params.set("brand", brandFilter);
        setSearchParams(params);
        navigate(`/products?${params.toString()}`);
    };

    // Cart context
    const { cartCount } = useCart();

    return (
        <header className={styles.home__navbar}>
            <div className={styles.home__logo} onClick={() => navigate("/")}>
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
                    onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                />
                <button onClick={submitSearch}>Tìm</button>
            </div>

            {/* AUTH */}
            <div className={styles.home__authButtons}>
                {user ? (
                    <div className={styles.home__userWrap}>
                        {/* Icon giỏ hàng */}
                        <button
                            className={styles.iconBtn}
                            onClick={() => navigate("/cart")}
                            aria-label="Giỏ hàng"
                        >
                            <span className={styles.cartIcon}>🛒</span>
                            {cartCount > 0 && (
                                <span className={styles.cartBadge}>{cartCount}</span>
                            )}
                        </button>

                        {/* Icon tài khoản */}
                        {/* Icon tài khoản */}
                        <div className={styles.accountMenu}>
                            <button className={styles.iconBtn} aria-label="Tài khoản">
                                👤
                            </button>
                            <div className={styles.accountDropdown}>
                                <span className={styles.home__userText}>
                                    {user.name || user.email}
                                </span>
                                <button
                                    className={styles.dropdownBtn}
                                    onClick={() => navigate("/account")}
                                >
                                    Cài đặt tài khoản của tôi
                                </button>
                                <button
                                    className={styles.dropdownBtn}
                                    onClick={handleLogout}
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    <>
                        <button
                            className={styles.home__btn}
                            onClick={() => navigate("/login")}
                        >
                            Đăng nhập
                        </button>
                        <button
                            className={`${styles.home__btn} ${styles["home__btn--primary"]}`}
                            onClick={() => navigate("/register")}
                        >
                            Đăng ký
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
