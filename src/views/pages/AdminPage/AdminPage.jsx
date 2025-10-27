import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../../layouts/admin/AdminLayout/AdminLayout";
import ProductManager from "../../components/admin/ProductManager/ProductManager";
import OrderManager from "../../components/admin/OrderManager/OrderManager";
import SongManager from "../../components/admin/SongManager/SongManager";
import UserManager from "../../components/admin/UserManager/UserManager";
import ReviewManager from "../../components/admin/ReviewManager/ReviewManager";
import CouponManager from "../../components/admin/CouponManager/CouponManager";
import NotificationManager from "../../components/admin/NotificationManager/NotificationManager";

export default function AdminPage() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="products" />} />
        <Route path="users" element={<UserManager />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="songs" element={<SongManager />} />
        <Route path="orders" element={<OrderManager />} />
        <Route path="reviews" element={<ReviewManager />} />
        <Route path="coupons" element={<CouponManager />} />
        <Route path="notifications" element={<NotificationManager />} />
      </Route>
    </Routes>
  );
}
