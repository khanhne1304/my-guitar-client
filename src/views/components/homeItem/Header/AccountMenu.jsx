import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

export default function AccountMenu({ user, handleLogout }) {
  const navigate = useNavigate();

  return (
    <div className={styles.accountMenu}>
      <button className={styles.iconBtn} aria-label="Tài khoản">
        👤
      </button>
      <div className={styles.accountDropdown}>
        <span className={styles.home__userText}>
          {user.name || user.email}
        </span>
        <button
          className={styles.dropdownBtn}
          onClick={() => navigate("/account")}
        >
          Cài đặt tài khoản của tôi
        </button>

        {/* Nút mới */}
        <button
          className={styles.dropdownBtn}
          onClick={() => navigate("/favorites")}
        >
          Danh sách yêu thích
        </button>
        <button
          className={styles.dropdownBtn}
          onClick={() => navigate("/favorites")}
        >
          Lịch sử đơn hàng
        </button>
        <button
          className={styles.dropdownBtn}
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
