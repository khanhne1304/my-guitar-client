// src/views/pages/HomePage/HomeView.jsx  (giữ nguyên đường dẫn file của bạn)
import { useEffect, useRef } from "react";
import styles from "./HomePage.module.css";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import Hero from "../../components/home/Hero";
import Section from "../../components/home/Section";
import ProductGrid from "../../components/home/ProductGrid";
import { useHomeViewModel } from "../../../viewmodels/HomeViewModel";
import { useCategory } from "../../../context/CategoryContext";
import ChatWidget from "../../components/chat/ChatWidget";
export default function HomePage() {
  const {
    products,
    loading,
    err,
    discountedTop3,
    selectedCategory,
    selectedBrand,
  } = useHomeViewModel();
  const { clearFilters } = useCategory();
  const hasClearedFilters = useRef(false);

  // Clear filters chỉ một lần khi component mount để đảm bảo trang chủ hiển thị tất cả sản phẩm
  useEffect(() => {
    if (!hasClearedFilters.current) {
      clearFilters();
      hasClearedFilters.current = true;
    }
  }, [clearFilters]);

  return (
    <div className={styles.home}>
      <Header />

      <main className={styles.home__content}>
        <div className={styles.home__container}>
          <Hero />

          {loading && <div>Đang tải sản phẩm…</div>}
          {err && <div className={styles.home__error}>{err}</div>}

          {!loading && !err && (
            <Section
              title={
                selectedCategory
                  ? `Sản phẩm ${selectedCategory.toUpperCase()}${
                      selectedBrand ? ` - ${selectedBrand}` : ""
                    }`
                  : "Các sản phẩm"
              }
            >
              {selectedCategory && (
                <div style={{ marginBottom: "16px" }}>
                  <button
                    onClick={clearFilters}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#ff6b6b",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
              <ProductGrid items={products} />
            </Section>
          )}

          {!loading && !err && (
            <Section
              title="Các sản phẩm giảm giá nhiều"
              titleClassName={styles.home__sectionTitleSale}
            >
              <ProductGrid
                items={discountedTop3}
                emptyText="Chưa có sản phẩm giảm giá."
              />
            </Section>
          )}
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
