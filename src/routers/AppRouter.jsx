import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import publicRoutes from "./routeConfig/publicRoute";
import privateRoutes, { socialPrivateRoutes } from "./routeConfig/privateRoute";
import adminRoutes from "./routeConfig/adminRoute";
import PrivateRoute from "./PrivateRoute";
import { CartProvider } from "../context/CartContext";
import { CategoryProvider } from "../context/CategoryContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { AddressProvider } from "../context/AddressContext";
import { PracticeProvider } from "../context/PracticeContext";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import { AlertProvider } from "../context/AlertContext";
import SocialLayout from "../views/layouts/SocialLayout/SocialLayout";
import NotFoundPage from "../views/pages/NotFoundPage/NotFoundPage";
import AuthenticatedMessaging from "../components/AuthenticatedMessaging/AuthenticatedMessaging";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function GuardedRoute({ element }) {
  return <PrivateRoute>{element}</PrivateRoute>;
}

export default function AppRouter() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AlertProvider>
            <CartProvider>
              <CategoryProvider>
                <FavoritesProvider>
                  <AddressProvider>
                    <PracticeProvider>
                      <AuthenticatedMessaging />
                      <ScrollToTop />
                      <Routes>
                        <Route element={<SocialLayout />}>
                          {socialPrivateRoutes.map((route) => (
                            <Route
                              key={route.path}
                              path={route.path}
                              element={<GuardedRoute element={route.element} />}
                            />
                          ))}
                        </Route>

                        {publicRoutes.map((route) => (
                          <Route
                            key={route.path}
                            path={route.path}
                            element={route.element}
                          />
                        ))}

                        {privateRoutes.map((route) => (
                          <Route
                            key={route.path}
                            path={route.path}
                            element={<GuardedRoute element={route.element} />}
                          />
                        ))}

                        {adminRoutes.map((route) => (
                          <Route
                            key={route.path}
                            path={route.path}
                            element={route.element}
                          />
                        ))}

                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </PracticeProvider>
                  </AddressProvider>
                </FavoritesProvider>
              </CategoryProvider>
            </CartProvider>
          </AlertProvider>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
