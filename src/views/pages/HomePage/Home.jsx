// src/pages/Home.jsx
import styles from './Home.module.css';
import Header from '../../components/HomePageItems/Header/Header';
import Footer from '../../components/HomePageItems/Footer/HomePageFooter';


import Hero from '../../components/home/Hero';
import Section from '../../components/home/Section';
import ProductGrid from '../../components/home/ProductGrid';


import { useProducts } from '../../../hooks/useProducts';
import { topDiscounts } from '../../../utils/pricing';


export default function Home() {
const { products, loading, err } = useProducts();
const discountedTop3 = topDiscounts(products, 3);


return (
<div className={styles.home}>
<Header products={products} />


<main className={styles.home__content}>
<div className={styles.home__container}>
<Hero />


{loading && <div>Đang tải sản phẩm…</div>}
{err && <div>{err}</div>}


{!loading && !err && (
<Section title='Các sản phẩm'>
<ProductGrid items={products} />
</Section>
)}


{!loading && !err && (
<Section title='Các sản phẩm giảm giá nhiều' titleClassName={styles.home__sectionTitleSale}>
<ProductGrid items={discountedTop3} emptyText='Chưa có sản phẩm giảm giá.' />
</Section>
)}
</div>
</main>


<Footer />
</div>
);
}