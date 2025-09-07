import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';

export default function NoteBox({ value, onChange }) {
  return (
    <div className={styles['checkout__box']}>
      <div className={styles['checkout__box-title']}>Ghi chú đơn hàng</div>
      <textarea
        className={styles['checkout__textarea']}
        placeholder="Ví dụ: để hàng ở bảo vệ, gọi trước khi giao..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
