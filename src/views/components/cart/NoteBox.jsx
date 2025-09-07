import styles from '../../pages/CartPage/CartPage.module.css';
export default function NoteBox({ note, onChange }) {
return (
<div className={styles.noteBox}>
<div className={styles.noteTitle}>Ghi chú đơn hàng</div>
<textarea
placeholder='Ví dụ: Giao sau 18h, gọi trước khi giao...'
value={note}
onChange={(e) => onChange(e.target.value)}
/>
</div>
);
}