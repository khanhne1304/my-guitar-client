// src/views/pages/AddressPage/AddressPage.jsx
import styles from './AddressPage.module.css';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import AddressBook from '../../components/AddressBook/AddressBook';

export default function AddressPage() {
  return (
    <div className={styles.addressPage}>
      <Header />

      <main className={styles.addressPage__main}>
        <div className={styles.addressPage__container}>
          <div className={styles.addressPage__header}>
            <h1>Sổ địa chỉ</h1>
            <p>Quản lý các địa chỉ giao hàng của bạn</p>
          </div>

          <div className={styles.addressPage__content}>
            <AddressBook />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
