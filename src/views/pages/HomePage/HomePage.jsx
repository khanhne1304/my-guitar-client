// HomeView.jsx
import styles from './HomePage.module.css';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/HomePageFooter';
import Hero from '../../components/home/Hero';
import Section from '../../components/home/Section';
import ProductGrid from '../../components/home/ProductGrid';
import { useHomeViewModel } from '../../../viewmodels/HomeViewModel';
import { MOCK_PRODUCTS } from '../../components//Data/dataProduct';

export default function HomePage() {
    //Lấy dữ liệu từ ViewModel
    //const { products, loading, err, discountedTop3 } = useHomeViewModel();
    // <- Dữ liệu mẫu ->
    const products = MOCK_PRODUCTS;
    const loading = false;
    const err = '';
    const discountedTop3 = [...products]
        .sort((a, b) => {
            const discountA = (a.price.base - a.price.sale) / a.price.base;
            const discountB = (b.price.base - b.price.sale) / b.price.base;
            return discountB - discountA;
        })
        .slice(0, 3);
    // <- Dữ liệu mẫu ->
    return (
        <div className={styles.home}>
            <Header products={products} />

            <main className={styles.home__content}>
                <div className={styles.home__container}>
                    <Hero />

                    {loading && <div>Đang tải sản phẩm…</div>}
                    {err && <div>{err}</div>}

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
