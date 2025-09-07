// src/components/category/Breadcrumb.jsx
import { Link } from 'react-router-dom';
import styles from '../../pages/CategoryPage/CategoryPage.module.css';

export default function Breadcrumb({ categorySlug }) {
const label = categorySlug?.toUpperCase() || '';
return (
<div className={styles.breadcrumb}>
<Link to='/'>Trang chủ</Link> <span>/</span>
<span className={styles.current}>{label}</span>
</div>
);
}