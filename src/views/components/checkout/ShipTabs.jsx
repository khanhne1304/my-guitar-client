import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';
export default function ShipTabs({ mode, onChange }) {
return (
<div className={styles.boxHead}>
<button className={`${styles.shipTab} ${mode==='delivery'?styles.active:''}`} onClick={() => onChange('delivery')}>
<span className={styles.truck}>🚚</span> Giao tận nơi
</button>
<button className={`${styles.shipTab} ${mode==='pickup'?styles.active:''}`} onClick={() => onChange('pickup')}>
<span>🏬</span> Nhận tại cửa hàng
</button>
</div>
);
}