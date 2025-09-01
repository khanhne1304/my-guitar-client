import { useEffect, useState, useMemo } from "react";
import styles from "./Home.module.css";
import ProductCard from "../../components/productCard/productCard";
import Footer from "../../components/HomePageItems/Footer/HomePageFooter";
import Header from "../../components/HomePageItems/Header/Header";
import { MOCK_PRODUCTS } from "../../components/Data/dataProduct";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Sử dụng dữ liệu mẫu
  useEffect(() => {
    setLoading(true);
    // Giả lập loading time
    setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }, 500);
  }, []);

  const discountedTop3 = useMemo(() => {
    return products
      .filter((p) => p.oldPrice && p.oldPrice > p.price)
      .sort((a, b) => b._discount - a._discount)
      .slice(0, 3)
      .map((p) => ({ ...p, name: `${p.name} • -${p._discount}%` }));
  }, [products]);

  return (
    <div className={styles.home}>
      <Header products={products} />

      <main className={styles.home__content}>
        <div className={styles.home__container}>
          <section className={styles.home__hero}>
            <div className={styles.home__heroText}>
              <h1>Nhạc cụ cho mọi người</h1>
              <p>Chọn đàn phù hợp và bắt đầu hành trình âm nhạc của bạn 🎶</p>
              <div className={styles.home__heroActions}>
                <a href="/products?category=guitar" className={styles.home__cta}>
                  Mua Guitar
                </a>
                <a
                  href="/products?category=piano"
                  className={`${styles.home__cta} ${styles["home__cta--ghost"]}`}
                >
                  Mua Piano
                </a>
              </div>
            </div>
          </section>

          {loading && <div>Đang tải sản phẩm…</div>}
          {err && <div>{err}</div>}

          {!loading && !err && (
            <section className={styles.home__section}>
              <h2 className={styles.home__sectionTitle}>Các sản phẩm</h2>
              {products.length ? (
                <div className={styles.home__grid}>
                  {products.map((p) => (
                    <ProductCard 
                      key={p.id || p._id} 
                      {...p} 
                      href={`/products/${p.slug}`}
                      onView={() => console.log('Xem sản phẩm:', p.name)}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.home__empty}>Không tìm thấy sản phẩm phù hợp.</div>
              )}
            </section>
          )}

          {!loading && !err && (
            <section className={styles.home__section}>
              <h2 className={`${styles.home__sectionTitle} ${styles.home__sectionTitleSale}`}>
                Các sản phẩm giảm giá nhiều
              </h2>
              <div className={styles.home__grid}>
                {discountedTop3.length ? (
                  discountedTop3.map((p) => (
                    <ProductCard 
                      key={`sale-${p.id || p._id}`} 
                      {...p} 
                      href={`/products/${p.slug}`}
                      onView={() => console.log('Xem sản phẩm giảm giá:', p.name)}
                    />
                  ))
                ) : (
                  <div className={styles.home__empty}>Chưa có sản phẩm giảm giá.</div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
