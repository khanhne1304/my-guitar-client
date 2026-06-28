import { FaUser, FaUserFriends, FaUserPlus, FaSearch, FaBell } from "react-icons/fa";
import { Link } from "react-router-dom";
import styles from "./LeftSidebar.module.css";

export default function LeftSidebar() {
  const items = [
    { icon: <FaUser />, label: "Trang cá nhân", to: "/profile" },
    { icon: <FaUserFriends />, label: "Danh sách bạn bè", to: "/friends" },
    { icon: <FaUserPlus />, label: "Lời mời kết bạn", to: "/friends/requests" },
    { icon: <FaSearch />, label: "Tìm kiếm", to: "/search" },
    { icon: <FaBell />, label: "Thông báo", to: "/notifications" },
  ];
  return (
    <aside className={styles._card}>
      <div className={styles._title}>Lối tắt</div>
      <div className={styles._list}>
        {items.map((it) => (
          it.to ? (
            <Link key={it.label} className={styles._item} to={it.to}>
              {it.icon}
              <span>{it.label}</span>
            </Link>
          ) : (
            <div
              key={it.label}
              className={styles._item}
              role="button"
            >
              {it.icon}
              <span>{it.label}</span>
            </div>
          )
        ))}
      </div>
    </aside>
  );
}

