import { NavLink, useNavigate } from "react-router-dom";
import styles from "./AdminSidebar.module.css";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa thông tin user & token
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className={styles.wrapper}>
      {/* Phần trên: tiêu đề + nav */}
      <div className={styles.top}>
        <h2 className={styles.title}>Admin</h2>
        <nav className={styles.nav}>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Quản lý sản phẩm
          </NavLink>
          <NavLink
            to="/admin/songs"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Quản lý bài hát
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Quản lý đơn hàng
          </NavLink>
        </nav>
      </div>

      {/* Nút đăng xuất */}
      <button className={styles.logout} onClick={handleLogout}>
        Đăng xuất
      </button>
    </aside>
  );
}
