// src/pages/Products.jsx
import { useNavigate } from 'react-router-dom';
import styles from './products.module.css';


import Header from '../../components/HomePageItems/Header/Header';
import Footer from '../../components/HomePageItems/Footer/HomePageFooter';
import { MOCK_PRODUCTS } from '../../components/Data/dataProduct';


import { useCategoriesFromProducts } from '../../../hooks/useCategoriesFromProducts';
import CategoryGrid from '../../components/Catalog/CategoryGrid';


export default function Products() {
const navigate = useNavigate();
const categories = useCategoriesFromProducts(MOCK_PRODUCTS);


const handleSelect = (slug) => {
navigate(`/products?category=${encodeURIComponent(slug)}`);
};


return (
<div className={styles.page}>
<Header products={MOCK_PRODUCTS} />


<main className={styles.main}>
<div className={styles.container}>
<h1 className={styles.title}>Danh mục sản phẩm</h1>
<CategoryGrid categories={categories} onSelect={handleSelect} />
</div>
</main>


<Footer />
</div>
);
}