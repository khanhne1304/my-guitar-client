import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../../layouts/admin/AdminLayout/AdminLayout";
import ProductManager from "../../components/admin/ProductManager/ProductManager";
import OrderManager from "../../components/admin/OrderManager/OrderManager";
import SongManager from "../../components/admin/SongManager/SongManager";
import ReferenceSongManager from "../../components/admin/ReferenceSongManager/ReferenceSongManager";
import UserManager from "../../components/admin/UserManager/UserManager";
import ReviewManager from "../../components/admin/ReviewManager/ReviewManager";
import CouponManager from "../../components/admin/CouponManager/CouponManager";
import NotificationManager from "../../components/admin/NotificationManager/NotificationManager";
import StatisticsReport from "../../components/admin/StatisticsReport/StatisticsReport";

export default function AdminPage() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="statistics" />} />
        <Route path="statistics" element={<StatisticsReport />} />
        <Route path="users" element={<UserManager />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="songs" element={<SongManager />} />
        <Route path="reference-songs" element={<ReferenceSongManager />} />
        <Route path="orders" element={<OrderManager />} />
        <Route path="reviews" element={<ReviewManager />} />
        <Route path="coupons" element={<CouponManager />} />
        <Route path="notifications" element={<NotificationManager />} />
      </Route>
    </Routes>
  );
}
