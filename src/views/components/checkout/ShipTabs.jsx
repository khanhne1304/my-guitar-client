import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';

export default function ShipTabs({ mode, onChange }) {
  return (
    <div className={styles['checkout__box-head']}>
      <button
        className={`${styles['checkout__ship-tab']} ${
          mode === 'delivery' ? styles['checkout__ship-tab--active'] : ''
        }`}
        onClick={() => onChange('delivery')}
      >
        <span className={styles['checkout__ship-icon']}>🚚</span> Giao tận nơi
      </button>
      <button
        className={`${styles['checkout__ship-tab']} ${
          mode === 'pickup' ? styles['checkout__ship-tab--active'] : ''
        }`}
        onClick={() => onChange('pickup')}
      >
        <span className={styles['checkout__ship-icon']}>🏬</span> Nhận tại cửa hàng
      </button>
    </div>
  );
}
