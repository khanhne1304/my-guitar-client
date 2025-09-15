import styles from "./Header.module.css";
import { useNavigate } from "react-router-dom";
import CartButton from "./CartButton";
import AccountMenu from "./AccountMenu";

export default function AuthButtons({ user, cartCount, handleLogout }) {
  const navigate = useNavigate();

  return (
    <div className={styles.home__authButtons}>
      {user ? (
        <div className={styles.home__userWrap}>
          <CartButton cartCount={cartCount} />
          <AccountMenu user={user} handleLogout={handleLogout} />
        </div>
      ) : (
        <>
          <button
            className={styles.home__btn}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
          <button
            className={`${styles.home__btn} ${styles["home__btn--primary"]}`}
            onClick={() => navigate("/register")}
          >
            Đăng ký
          </button>
        </>
      )}
    </div>
  );
}
