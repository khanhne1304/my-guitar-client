import styles from '../../pages/CartPage/CartPage.module.css';

export default function CartItemRow({ item, onDec, onInc, onUpdate, onRemove }) {
  return (
    <article className={styles['cart__row']}>
      <div className={styles['cart__pic']}>
        <img src={item.image} alt={item.name} />
      </div>

      <div className={styles['cart__info']}>
        <div className={styles['cart__name']}>{item.name}</div>
        <div className={styles['cart__sku']}>{item.sku}</div>

        <div className={styles['cart__price-row']}>
          <span className={styles['cart__price']}>{item._fmtPrice}</span>
        </div>

        <div className={styles['cart__qty-row']}>
          <button
            className={styles['cart__qty-btn']}
            onClick={() => onDec(item._id)}
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <input
            className={styles['cart__qty-input']}
            type="number"
            min={1}
            value={item.qty}
            onChange={(e) =>
              onUpdate(
                item._id,
                Math.max(1, parseInt(e.target.value || '1', 10))
              )
            }
          />
          <button
            className={styles['cart__qty-btn']}
            onClick={() => onInc(item._id, item.stock)}
            aria-label="Tăng số lượng"
          >
            +
          </button>

          <button
            className={styles['cart__remove-btn']}
            onClick={() => onRemove(item._id)}
          >
            Xóa
          </button>
        </div>
      </div>
    </article>
  );
}
