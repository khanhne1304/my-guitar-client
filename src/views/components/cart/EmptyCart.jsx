import styles from '../../pages/CartPage/CartPage.module.css';

export default function EmptyCart({ onShop }) {
  return (
    <div className={styles['cart__empty']}>
      Giỏ hàng đang trống.
      <button
        className={styles['cart__btn--primary']}
        onClick={onShop}
      >
        Mua sắm ngay
      </button>
    </div>
  );
}
