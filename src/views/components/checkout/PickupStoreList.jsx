import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';
export default function PickupStoreList({ stores, cartItems, storeId, setStoreId }) {
if (!stores.length) {
return <div className={styles.storeEmpty}>Không có cửa hàng nào còn đủ hàng cho đơn của bạn.</div>;
}
return (
<div className={styles.storeList}>
{stores.map((s) => (
<label key={s.id} className={styles.storeItem}>
<input type='radio' name='store' value={s.id} checked={storeId===s.id} onChange={(e)=>setStoreId(e.target.value)}/>
<div className={styles.storeContent}>
<div className={styles.storeName}>{s.name}</div>
<div className={styles.storeAddr}>{s.address}</div>
<div className={styles.storePhone}>📞 {s.phone}</div>
<div className={styles.storeStock}>
{cartItems.map((it) => (
<span key={it._id} className={styles.tag}>
{it.sku || it.name}: {s.inventory[it.slug] || 0} sp
</span>
))}
</div>
</div>
</label>
))}
</div>
);
}