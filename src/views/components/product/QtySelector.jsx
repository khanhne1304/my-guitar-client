import styles from '../../pages/ProductDetailsPage/ProductDetailsPage.module.css';

export default function QtySelector({ qty, setQty, stock = 1 }) {
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(stock || 1, q + 1));
  const onChange = (e) => {
    const v = parseInt(e.target.value || '1', 10);
    if (Number.isNaN(v)) return;
    const clamped = Math.max(1, Math.min(v, stock || 1));
    setQty(clamped);
  };

  return (
    <div className={styles['product-details__qty']}>
      <span>Số lượng</span>
      <div className={styles['product-details__qty-box']}>
        <button
          className={styles['product-details__qty-btn']}
          onClick={dec}
          aria-label="Giảm số lượng"
        >
          −
        </button>
        <input
          className={styles['product-details__qty-input']}
          type="number"
          min={1}
          max={stock || 1}
          value={qty}
          onChange={onChange}
        />
        <button
          className={styles['product-details__qty-btn']}
          onClick={inc}
          aria-label="Tăng số lượng"
        >
          +
        </button>
      </div>
      <span className={styles['product-details__stock-note']}>
        {stock > 0 ? `${stock} sản phẩm có sẵn` : 'Hết hàng'}
      </span>
    </div>
  );
}
