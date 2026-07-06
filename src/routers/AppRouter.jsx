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
import { AlertProvider } from "../context/AlertContext";
import SocialLayout from "../views/layouts/SocialLayout/SocialLayout";
import ProfilePage from "../views/pages/ProfilePage/ProfilePage";
import FriendsListPage from "../views/pages/FriendsPage/FriendsListPage";
import FriendRequestsPage from "../views/pages/FriendsPage/FriendRequestsPage";
import SearchPage from "../views/pages/SearchPage/SearchPage";
import ProtectedNotificationCenter from "../views/pages/NotificationCenter/ProtectedNotificationCenter";
import MessengerPage from "../views/pages/MessengerPage/MessengerPage";
import NotFoundPage from "../views/pages/NotFoundPage/NotFoundPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function AppRouter() {
  const socialPaths = new Set([
    "/profile",
    "/friends",
    "/friends/requests",
    "/messenger",
    "/search",
    "/notifications",
  ]);

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
                    <ScrollToTop />
                    <Routes>
                      <Route element={<SocialLayout />}>
                        <Route path="/profile" element={<ProfilePage embedded />} />
                        <Route path="/friends" element={<FriendsListPage embedded />} />
                        <Route path="/friends/requests" element={<FriendRequestsPage embedded />} />
                        <Route path="/messenger" element={<MessengerPage />} />
                        <Route path="/search" element={<SearchPage embedded />} />
                        <Route path="/notifications" element={<ProtectedNotificationCenter />} />
                      </Route>

                      {publicRoutes
                        .filter((r) => !socialPaths.has(r.path))
                        .map((route) => (
                          <Route key={route.path} path={route.path} element={route.element} />
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
