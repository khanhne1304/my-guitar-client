// src/views/pages/HomePage/HomeView.jsx  (giữ nguyên đường dẫn file của bạn)
import styles from './HomePage.module.css';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import Hero from '../../components/home/Hero';
import Section from '../../components/home/Section';
import ProductGrid from '../../components/home/ProductGrid';
import { useHomeViewModel } from '../../../viewmodels/HomeViewModel';

export default function HomePage() {
  const { products, loading, err, discountedTop3 } = useHomeViewModel();

  return (
    <div className={styles.home}>
      <Header />

      <main className={styles.home__content}>
        <div className={styles.home__container}>
          <Hero />

          {loading && <div>Đang tải sản phẩm…</div>}
          {err && <div className={styles.home__error}>{err}</div>}

          {!loading && !err && (
            <Section title="Các sản phẩm">
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
    </div>
  );
}
