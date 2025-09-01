import styles from '../../pages/CheckoutPage/checkout.module.css';
export default function NoteBox({ value, onChange }) {
return (
<div className={styles.box}>
<div className={styles.boxTitle}>Ghi chú đơn hàng</div>
<textarea className={styles.textarea} placeholder='Ví dụ: để hàng ở bảo vệ, gọi trước khi giao...' value={value} onChange={(e)=>onChange(e.target.value)} />
</div>
);
}