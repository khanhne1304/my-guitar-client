import AdminSidebar from "../../../components/sidebar/AdminSidebar";
import { Outlet } from "react-router-dom";
import styles from "./AdminLayout.module.css";

export default function AdminLayout() {
  return (
    <div className={styles.adminLayout}>
      {/* Sidebar cố định bên trái */}
      <AdminSidebar />

      {/* Nội dung chính nằm bên phải */}
      <main className={styles.adminContent}>
        <Outlet />
      </main>
    </div>
  );
}
