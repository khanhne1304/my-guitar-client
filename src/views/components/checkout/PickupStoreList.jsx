import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';

export default function PickupStoreList({ stores, cartItems, storeId, setStoreId }) {
  if (!stores.length) {
    return (
      <div className={styles['checkout__store-empty']}>
        Không có cửa hàng nào còn đủ hàng cho đơn của bạn.
      </div>
    );
  }

  return (
    <div className={styles['checkout__store-list']}>
      {stores.map((s) => (
        <label key={s.id} className={styles['checkout__store-item']}>
          <input
            type="radio"
            name="store"
            value={s.id}
            checked={storeId === s.id}
            onChange={(e) => setStoreId(e.target.value)}
          />
          <div className={styles['checkout__store-content']}>
            <div className={styles['checkout__store-name']}>{s.name}</div>
            <div className={styles['checkout__store-addr']}>{s.address}</div>
            <div className={styles['checkout__store-phone']}>📞 {s.phone}</div>
            <div className={styles['checkout__store-stock']}>
              {cartItems.map((it) => (
                <span key={it._id} className={styles['checkout__tag']}>
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
