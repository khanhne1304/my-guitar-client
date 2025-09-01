// src/components/category/Toolbar.jsx
import styles from '../../pages/CategoryPage/Category.module.css';


export default function Toolbar({ sortBy, onSortChange }) {
return (
<div className={styles.filters}>
<button className={styles.filterBtn} disabled>
Giá
</button>
<button className={styles.filterBtn} disabled>
Tính năng
</button>
<button className={styles.filterBtn} disabled>
Thương hiệu
</button>
<div className={styles.sort}>
<label>Sắp xếp theo:</label>
<select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
<option value='default'>Mặc định</option>
<option value='price-asc'>Giá tăng dần</option>
<option value='price-desc'>Giá giảm dần</option>
<option value='name-asc'>Tên A-Z</option>
<option value='name-desc'>Tên Z-A</option>
</select>
</div>
</div>
);
}