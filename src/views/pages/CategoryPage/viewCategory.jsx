import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import styles from "./Category.module.css";
import ProductCard from "../../components/productCard/productCard";
import Header from "../../components/HomePageItems/Header/Header";
import Footer from "../../components/HomePageItems/Footer/HomePageFooter";
import { MOCK_PRODUCTS } from "../../components/Data/dataProduct";

export default function ViewCategory() {
  const { slug } = useParams(); // ví dụ: piano, guitar (từ /category/:slug)
  const [searchParams] = useSearchParams(); // để lấy category từ query params
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [sortBy, setSortBy] = useState("default"); // default, price-asc, price-desc, name-asc, name-desc

  // Lấy category từ URL params hoặc query params
  const categorySlug = slug || searchParams.get("category");

  useEffect(() => {
    if (!categorySlug) return;
    
    setLoading(true);
    setErr("");
    
    // Sử dụng dữ liệu mẫu thay vì API
    setTimeout(() => {
      const filteredProducts = MOCK_PRODUCTS.filter(
        (p) => p.category?.slug === categorySlug
      );
      setProducts(filteredProducts);
      setLoading(false);
    }, 500);
  }, [categorySlug]);

  // Sắp xếp sản phẩm
  const sortedProducts = useMemo(() => {
    if (!products.length) return [];
    
    const sorted = [...products];
    
    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => {
          const priceA = a.price?.sale && a.price.sale !== 0 ? a.price.sale : a.price?.base || 0;
          const priceB = b.price?.sale && b.price.sale !== 0 ? b.price.sale : b.price?.base || 0;
          return priceA - priceB;
        });
      case "price-desc":
        return sorted.sort((a, b) => {
          const priceA = a.price?.sale && a.price.sale !== 0 ? a.price.sale : a.price?.base || 0;
          const priceB = b.price?.sale && b.price.sale !== 0 ? b.price.sale : b.price?.base || 0;
          return priceB - priceA;
        });
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  }, [products, sortBy]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className={styles.categoryPage}>
      <Header products={MOCK_PRODUCTS} />

      <main className={styles.categoryMain}>
        <div className={styles.categoryWrap}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link to="/">Trang chủ</Link> <span>/</span>
            <span className={styles.current}>{categorySlug?.toUpperCase()}</span>
          </div>

          {/* Tiêu đề */}
          <h1 className={styles.title}>Danh mục: {categorySlug?.toUpperCase()}</h1>

          {/* Thanh lọc & sort */}
          <div className={styles.filters}>
            <button className={styles.filterBtn}>Giá</button>
            <button className={styles.filterBtn}>Tính năng</button>
            <button className={styles.filterBtn}>Thương hiệu</button>
            <div className={styles.sort}>
              <label>Sắp xếp theo:</label>
              <select value={sortBy} onChange={handleSortChange}>
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
              </select>
            </div>
          </div>

          {/* Grid sản phẩm */}
          {loading && <div>Đang tải...</div>}
          {err && <div className={styles.error}>{err}</div>}
          {!loading && !err && (
            <div className={styles.grid}>
              {sortedProducts.length ? (
                sortedProducts.map((p) => (
                  <ProductCard
                    key={p._id}
                    {...p}
                    href={`/products/${p.slug}`}
                    onView={() => console.log('Xem sản phẩm:', p.name)}
                  />
                ))
              ) : (
                <div className={styles.empty}>Chưa có sản phẩm trong danh mục này</div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
