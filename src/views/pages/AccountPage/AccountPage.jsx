// Account.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AccountPage.module.css";

import Header from "../../components/HomePageItems/Header/Header";
import Footer from "../../components/HomePageItems/Footer/HomePageFooter";
import { MOCK_PRODUCTS } from "../../components/Data/dataProduct";

export default function Account() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={styles.account}>
      <Header products={MOCK_PRODUCTS} />

      <main className={styles["account__main"]}>
        <div className={styles["account__container"]}>
          <h1 className={styles["account__title"]}>Tài khoản của tôi</h1>

          {!user ? (
            <div className={styles["account__state"]}>
              Bạn chưa đăng nhập.{" "}
              <button
                className={`${styles["account__btn"]} ${styles["account__btn--primary"]}`}
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>
            </div>
          ) : (
            <div className={styles["account__card"]}>
              <div className={styles["account__row"]}>
                <span className={styles["account__label"]}>Họ và tên</span>
                <span className={styles["account__value"]}>{val(user?.name || user?.fullName)}</span>
              </div>

              <div className={styles["account__row"]}>
                <span className={styles["account__label"]}>Email</span>
                <span className={styles["account__value"]}>{val(user?.email)}</span>
              </div>

              <div className={styles["account__row"]}>
                <span className={styles["account__label"]}>Tên tài khoản</span>
                <span className={styles["account__value"]}>{val(user?.username)}</span>
              </div>

              <div className={styles["account__row"]}>
                <span className={styles["account__label"]}>Số điện thoại</span>
                <span className={styles["account__value"]}>{val(user?.phone || user?.phoneNumber)}</span>
              </div>

              <div className={styles["account__row"]}>
                <span className={styles["account__label"]}>Địa chỉ</span>
                <span className={styles["account__value"]}>
                  {val(
                    typeof user?.address === "object"
                      ? [user.address?.address, user.address?.district, user.address?.country]
                          .filter(Boolean)
                          .join(", ")
                      : user?.address
                  )}
                </span>
              </div>

              <div className={styles["account__row"]}>
                <span className={styles["account__label"]}>Ngày tạo</span>
                <span className={styles["account__value"]}>
                  {fmtDate(user?.createdAt || user?.created_at)}
                </span>
              </div>

              <div className={styles["account__actions"]}>
                <button
                  className={`${styles["account__btn"]} ${styles["account__btn--primary"]}`}
                  onClick={() => navigate("/account/edit")}
                >
                  Cập nhật thông tin
                </button>
                <button
                  className={`${styles["account__btn"]} ${styles["account__btn--ghost"]}`}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
