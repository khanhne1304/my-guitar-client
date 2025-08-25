import { Link, useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import ProductCard from "../../components/productCard/productCard";
import Footer from "../../components/HomePageItems/Footer/HomePageFooter";

export default function Home() {
  const navigate = useNavigate();

  // Demo data – sau này thay bằng API
  const products = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1600&auto=format&fit=crop",
      name: "Casio CDP-S360",
      brand: "CASIO",
      model: "CDP-S360",
      category: "piano",
      price: 16800000,
      oldPrice: 19740000,
      href: "/products/casio-cdp-s360",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?q=80&w=1600&auto=format&fit=crop",
      name: "Yamaha P-125",
      brand: "YAMAHA",
      model: "P-125",
      category: "piano",
      price: 18790000,
      oldPrice: 20990000,
      href: "/products/yamaha-p125",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1600&auto=format&fit=crop",
      name: "Fender FA-125",
      brand: "FENDER",
      model: "FA-125",
      category: "guitar",
      price: 3990000,
      oldPrice: 4590000,
      href: "/products/fender-fa125",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1600&auto=format&fit=crop",
      name: "Casio CT-S300",
      brand: "CASIO",
      model: "CT-S300",
      category: "piano",
      price: 3790000,
      oldPrice: 4490000,
      href: "/products/casio-cts300",
    },
  ];

  // Gom brand theo category để hiển thị dropdown
  const brandsByCategory = products.reduce((acc, p) => {
    const cat = p.category?.toLowerCase();
    const brand = p.brand?.toUpperCase();
    if (!cat || !brand) return acc;
    acc[cat] ??= new Set();
    acc[cat].add(brand);
    return acc;
  }, /** @type {Record<string, Set<string>>} */ ({}));

  const guitarBrands = Array.from(brandsByCategory["guitar"] ?? []);
  const pianoBrands = Array.from(brandsByCategory["piano"] ?? []);

  // Tính % giảm và lấy TOP 3
  const discountedTop3 = products
    .filter((p) => p.oldPrice && p.oldPrice > p.price)
    .map((p) => ({
      ...p,
      discount: Math.round((1 - p.price / p.oldPrice) * 100),
    }))
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 3)
    .map((p) => ({ ...p, name: `${p.name} • -${p.discount}%` }));

  return (
    <div className={styles.home}>
      {/* HEADER */}
      <header className={styles.home__navbar}>
        <div className={styles.home__logo}>🎸 MyMusic</div>

        <nav className={styles.home__menu}>
          {/* Guitar */}
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
                <span className={styles.home__submenuEmpty}>Chưa có thương hiệu</span>
              )}
            </div>
          </div>

          {/* Piano */}
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
                <span className={styles.home__submenuEmpty}>Chưa có thương hiệu</span>
              )}
            </div>
          </div>

          {/* Các mục tĩnh cũng bọc trong menuItem để đồng bộ căn chỉnh */}
          <div className={styles.home__menuItem}>
            <Link to="/">Khóa học</Link>
          </div>
          <div className={styles.home__menuItem}>
            <Link to="/">Công cụ</Link>
          </div>
        </nav>

        <div className={styles.home__searchBox}>
          <input type="text" placeholder="Tìm kiếm..." />
          <button>Tìm</button>
        </div>

        <div className={styles.home__authButtons}>
          <button className={styles.home__btn} onClick={() => navigate("/login")}>
            Đăng nhập
          </button>
          <button
            className={`${styles.home__btn} ${styles["home__btn--primary"]}`}
            onClick={() => navigate("/register")}
          >
            Đăng ký
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className={styles.home__content}>
        <div className={styles.home__container}>
          {/* Sản phẩm chung */}
          <section className={styles.home__section}>
            <h2 className={styles.home__sectionTitle}>Các sản phẩm</h2>
            <div className={styles.home__grid}>
              {products.map((p, idx) => (
                <ProductCard key={`${p.id}-${idx}`} {...p} />
              ))}
            </div>
          </section>

          {/* Sản phẩm giảm giá nhiều */}
          <section className={styles.home__section}>
            <h2
              className={`${styles.home__sectionTitle} ${styles.home__sectionTitleSale}`}
            >
              Các sản phẩm giảm giá nhiều
            </h2>
            <div className={`${styles.home__grid} ${styles.home__gridSale}`}>
              {discountedTop3.length ? (
                discountedTop3.map((p, idx) => (
                  <ProductCard key={`sale-${p.id}-${idx}`} {...p} />
                ))
              ) : (
                <div className={styles.home__empty}>Chưa có sản phẩm giảm giá.</div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
