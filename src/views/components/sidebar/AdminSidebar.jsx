import { NavLink, useNavigate } from "react-router-dom";
import styles from "./AdminSidebar.module.css";
import { useCart } from "../../../context/CartContext";
import { usePractice } from "../../../context/PracticeContext";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { clearCartOnLogout } = useCart();
  const { resetProgress } = usePractice();

  const handleLogout = () => {
    // Xóa giỏ hàng trước khi đăng xuất
    clearCartOnLogout();
    
    // Reset practice progress
    resetProgress();
    
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
            to="/admin/statistics"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Báo cáo thống kê
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Quản lý Users
          </NavLink>
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
          <NavLink
            to="/admin/reviews"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Quản lý bình luận
          </NavLink>
          <NavLink
            to="/admin/coupons"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Quản lý khuyến mãi
          </NavLink>
          <NavLink
            to="/admin/notifications"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Quản lý thông báo
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
