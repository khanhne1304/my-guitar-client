import { Routes, Route, Navigate } from "react-router-dom";
import AdminOnly from "./AdminOnly";
import AdminLayout from "../../layouts/admin/AdminLayout/AdminLayout";
import ProductManager from "../../components/admin/ProductManager/ProductManager";
import OrderManager from "../../components/admin/OrderManager/OrderManager";
import BannerManager from "../../components/admin/BannerManager/BannerManager";
import BrandManager from "../../components/admin/BrandManager/BrandManager";
import UserManager from "../../components/admin/UserManager/UserManager";
import ReviewManager from "../../components/admin/ReviewManager/ReviewManager";
import CouponManager from "../../components/admin/CouponManager/CouponManager";
import NotificationManager from "../../components/admin/NotificationManager/NotificationManager";
import StatisticsReport from "../../components/admin/StatisticsReport/StatisticsReport";
import ForumReportManager from "../../components/admin/ForumReportManager/ForumReportManager";
import CourseManager from "../../components/admin/CourseManager/CourseManager";

export default function AdminPage() {
  return (
    <AdminOnly>
      <Routes>
        <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="statistics" />} />
        <Route path="statistics" element={<StatisticsReport />} />
        <Route path="users" element={<UserManager />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="courses" element={<CourseManager />} />
        <Route path="brands" element={<BrandManager />} />
        <Route path="banners" element={<BannerManager />} />
        <Route path="orders" element={<OrderManager />} />
        <Route path="reviews" element={<ReviewManager />} />
        <Route path="coupons" element={<CouponManager />} />
        <Route path="notifications" element={<NotificationManager />} />
        <Route path="forum-reports" element={<ForumReportManager />} />
        </Route>
      </Routes>
    </AdminOnly>
  );
}
