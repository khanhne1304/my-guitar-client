import styles from '../../pages/CartPage/cart.module.css';
export default function EmptyCart({ onShop }) {
return (
<div className={styles.empty}>
Giỏ hàng đang trống.
<button className={styles.btnPrimary} onClick={onShop}>
Mua sắm ngay
</button>
</div>
);
}