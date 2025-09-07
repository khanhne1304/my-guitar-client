import styles from '../../pages/CheckoutPage/CheckoutPage.module.css';

export default function AddressForm({ form, setForm }) {
  return (
    <div className={styles['checkout__form']}>
      <input
        className={styles['checkout__input']}
        placeholder="Nhập họ và tên"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className={styles['checkout__input']}
        placeholder="Nhập số điện thoại"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <input
        className={styles['checkout__input']}
        placeholder="Nhập email (không bắt buộc)"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className={styles['checkout__input']}
        value={form.country}
        readOnly
      />
      <input
        className={styles['checkout__input']}
        placeholder="Địa chỉ, tên đường"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <input
        className={styles['checkout__input']}
        placeholder="Tỉnh/TP, Quận/Huyện, Phường/Xã"
        value={form.district}
        onChange={(e) => setForm({ ...form, district: e.target.value })}
      />
    </div>
  );
}
