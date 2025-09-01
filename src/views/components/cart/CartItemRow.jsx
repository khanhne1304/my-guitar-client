import styles from '../../pages/CartPage/cart.module.css';


export default function CartItemRow({ item, onDec, onInc, onUpdate, onRemove }) {
return (
<article className={styles.row}>
<div className={styles.picWrap}>
<img src={item.image} alt={item.name} />
</div>


<div className={styles.info}>
<div className={styles.name}>{item.name}</div>
<div className={styles.sku}>{item.sku}</div>


<div className={styles.priceRow}>
<span className={styles.price}>{item._fmtPrice}</span>
</div>


<div className={styles.qtyRow}>
<button className={styles.qtyBtn} onClick={() => onDec(item._id)} aria-label='Giảm số lượng'>−</button>
<input
type='number'
min={1}
value={item.qty}
onChange={(e) => onUpdate(item._id, Math.max(1, parseInt(e.target.value || '1', 10)))}
/>
<button className={styles.qtyBtn} onClick={() => onInc(item._id, item.stock)} aria-label='Tăng số lượng'>+</button>


<button className={styles.removeBtn} onClick={() => onRemove(item._id)}>Xóa</button>
</div>
</div>
</article>
);
}