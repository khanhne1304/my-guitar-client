import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./products.module.css";

import Header from "../../components/HomePageItems/Header/Header";
import Footer from "../../components/HomePageItems/Footer/HomePageFooter";
import { MOCK_PRODUCTS } from "../../components/Data/dataProduct";

const CATEGORY_COVERS = {
  guitar:
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1600&auto=format&fit=crop",
  piano:
    "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?q=80&w=800&auto=format&fit=crop",
};

export default function Products() {
  const navigate = useNavigate();

  // Gom category từ MOCK_PRODUCTS
  const categories = useMemo(() => {
    const map = new Map();
    for (const p of MOCK_PRODUCTS) {
      const slug = p.category?.slug;
      const name = p.category?.name;
      if (!slug || !name) continue;
      if (!map.has(slug)) {
        // tìm ảnh cover: ưu tiên cover tĩnh, sau đó lấy ảnh đầu tiên của sản phẩm thuộc cat
        const cover =
          CATEGORY_COVERS[slug] ||
          p.images?.[0]?.url ||
          "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=1600&auto=format&fit=crop";

        map.set(slug, {
          slug,
          name,
          cover,
          count: 1,
        });
      } else {
        map.get(slug).count += 1;
      }
    }
    // Sắp xếp cho đẹp
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "vi")
    );
  }, []);

  return (
    <div className={styles.page}>
      <Header products={MOCK_PRODUCTS} />

      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Danh mục sản phẩm</h1>

          <div className={styles.grid}>
            {categories.map((c) => (
              <article
                key={c.slug}
                className={styles.card}
                onClick={() => navigate(`/products?category=${encodeURIComponent(c.slug)}`)}
                role="button"
                tabIndex={0}
              >
                <img className={styles.bg} src={c.cover} alt={c.name} />
                <div className={styles.overlay} />
                <div className={styles.label}>
                  <span className={styles.arrow}>»</span>{" "}
                  {c.name}
                  <span className={styles.count}>({c.count})</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
