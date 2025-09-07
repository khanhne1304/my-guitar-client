import styles from '../../pages/CartPage/CartPage.module.css';

export default function InvoiceCheck({ checked, onChange }) {
  return (
    <label className={styles['cart__invoice']}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>Xuất hoá đơn cho đơn hàng</span>
    </label>
  );
}
