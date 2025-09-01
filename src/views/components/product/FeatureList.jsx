// src/components/product/FeatureList.jsx
import styles from '../../pages/productDetails/productDetails.module.css';


export default function FeatureList({ items = [] }) {
if (!items?.length) return null;
return (
<div className={styles.featureBox}>
<h4>🌟 Đặc điểm nổi bật</h4>
<ul>{items.map((h, i) => <li key={i}>{h}</li>)}</ul>
</div>
);
}