// src/views/pages/HomePage/HomeView.jsx  (giữ nguyên đường dẫn file của bạn)
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import Hero from "../../components/home/Hero";
import Section from "../../components/home/Section";
import ProductGrid from "../../components/home/ProductGrid";
import ThreadCard from "../../components/forum/ThreadCard/ThreadCard";
import { useHomeViewModel } from "../../../viewmodels/HomeViewModel";
import { useCategory } from "../../../context/CategoryContext";
import ChatWidget from "../../components/chat/ChatWidget";
import { forumApi } from "../../../services/forumApi";

const HOME_FORUM_PREVIEW = 6;

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
  const [forumThreads, setForumThreads] = useState([]);
  const [forumLoading, setForumLoading] = useState(true);
  const [forumErr, setForumErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setForumLoading(true);
        setForumErr("");
        const data = await forumApi.listThreads({ sort: "newest" });
        if (!alive) return;
        const list = Array.isArray(data) ? data : [];
        setForumThreads(list.slice(0, HOME_FORUM_PREVIEW));
      } catch (e) {
        if (!alive) return;
        setForumThreads([]);
        setForumErr(e?.message || "Không tải được diễn đàn.");
      } finally {
        if (!alive) return;
        setForumLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

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

          <Section title="Chủ đề diễn đàn mới">
            {forumLoading && (
              <div className={styles.home__forumHint}>Đang tải chủ đề…</div>
            )}
            {forumErr && !forumLoading ? (
              <div className={styles.home__error}>{forumErr}</div>
            ) : null}
            {!forumLoading && !forumErr && forumThreads.length === 0 ? (
              <div className={styles.home__forumHint}>Chưa có chủ đề nào.</div>
            ) : null}
            {!forumLoading && forumThreads.length > 0 ? (
              <div className={styles.home__forumList}>
                {forumThreads.map((t) => (
                  <ThreadCard key={t._id || t.id} thread={t} />
                ))}
              </div>
            ) : null}
            <div className={styles.home__forumMore}>
              <Link to="/forum">Xem tất cả trong diễn đàn →</Link>
            </div>
          </Section>

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
