// Account.jsx
import { useEffect, useState } from "react";
import styles from "./Account.module.css";
import Header from "../../components/HomePageItems/Header/Header";
import Footer from "../../components/HomePageItems/Footer/HomePageFooter";
import { MOCK_PRODUCTS } from "../../components/Data/dataProduct";

export default function Account() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);

  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    // bạn có thể đổi định dạng theo ý
    return d.toLocaleString("vi-VN", {
      hour12: false,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const val = (v) => (v && String(v).trim() ? v : "—");

  return (
    <div className={styles.page}>
      <Header products={MOCK_PRODUCTS} />

      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Tài khoản của tôi</h1>

          <div className={styles.card}>
            <div className={styles.row}>
              <span>Họ và tên</span>
              <b>{val(user?.name)}</b>
            </div>
            <div className={styles.row}>
              <span>Email</span>
              <b>{val(user?.email)}</b>
            </div>
            <div className={styles.row}>
              <span>Tên tài khoản</span>
              <b>{val(user?.username)}</b>
            </div>
            <div className={styles.row}>
              <span>Số điện thoại</span>
              <b>{val(user?.phone)}</b>
            </div>
            <div className={styles.row}>
              <span>Địa chỉ</span>
              <b>{val(user?.address)}</b>
            </div>
            <div className={styles.row}>
              <span>Ngày tạo</span>
              <b>{fmtDate(user?.createdAt || user?.created_at)}</b>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.btn}
                onClick={() => (window.location.href = "/account/edit")}
              >
                Cập nhật thông tin
              </button>
              <button
                className={`${styles.btn} ${styles.outline}`}
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
