import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../../layouts/admin/AdminLayout/AdminLayout";
import ProductManager from "../../components/admin/ProductManager/ProductManager";
import OrderManager from "../../components/admin/OrderManager/OrderManager";
import SongManager from "../../components/admin/SongManager/SongManager";

export default function AdminPage() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="products" />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="songs" element={<SongManager />} />
        <Route path="orders" element={<OrderManager />} />
      </Route>
    </Routes>
  );
}
