// src/router/AppRouter.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import publicRoutes from "./routeConfig/publicRoute";
import { CartProvider } from "../context/CartContext";
import { CategoryProvider } from "../context/CategoryContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { AddressProvider } from "../context/AddressContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function AppRouter() {
  return (
    <CartProvider>
      <CategoryProvider>
        <FavoritesProvider>
          <AddressProvider>
            <ScrollToTop />
            <Routes>
              {publicRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
              <Route path="*" element={<div style={{ padding: 16 }}>404</div>} />
            </Routes>
          </AddressProvider>
        </FavoritesProvider>
      </CategoryProvider>
    </CartProvider>
  );
}
