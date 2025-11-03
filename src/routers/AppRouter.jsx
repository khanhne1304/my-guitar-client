// src/router/AppRouter.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import publicRoutes from "./routeConfig/publicRoute";
import { CartProvider } from "../context/CartContext";
import { CategoryProvider } from "../context/CategoryContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { AddressProvider } from "../context/AddressContext";
import { PracticeProvider } from "../context/PracticeContext";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function AppRouter() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <CartProvider>
            <CategoryProvider>
              <FavoritesProvider>
                <AddressProvider>
                  <PracticeProvider>
                    <ScrollToTop />
                    <Routes>
                      {publicRoutes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.element} />
                      ))}
                      <Route path="*" element={<div style={{ padding: 16 }}>404</div>} />
                    </Routes>
                  </PracticeProvider>
                </AddressProvider>
              </FavoritesProvider>
            </CategoryProvider>
          </CartProvider>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
