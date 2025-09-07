import styles from '../../pages/CategoryPage/CategoryPage.module.css';

export default function Toolbar({ sortBy, onSortChange }) {
  return (
    <div className={styles['category__filters']}>
      <button className={styles['category__filter-btn']} disabled>
        Giá
      </button>
      <button className={styles['category__filter-btn']} disabled>
        Tính năng
      </button>
      <button className={styles['category__filter-btn']} disabled>
        Thương hiệu
      </button>
      <div className={styles['category__sort']}>
        <label>Sắp xếp theo:</label>
        <select
          className={styles['category__sort-select']}
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="default">Mặc định</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
          <option value="name-asc">Tên A-Z</option>
          <option value="name-desc">Tên Z-A</option>
        </select>
      </div>
    </div>
  );
}
