// routeConfig/publicRoute.jsx
import Home from "../../views/pages/HomePage/HomePage";
import Register from "../../views/pages/RegisterPage/RegisterPage";
import Login from "../../views/pages/LoginPage/LoginPage";
import ProductDetails from "../../views/pages/ProductDetailsPage/ProductDetailsPage";
import ViewCategory from "../../views/pages/CategoryPage/CategoryPage";
import Cart from "../../views/pages/CartPage/CartPage";
import Checkout from "../../views/pages/CheckoutPage/CheckoutPage";
import CheckOutHistory from "../../views/pages/CheckOutHistory/CheckOutHistory";
import ProductsCategory from "../../views/pages/ProductsPage/ProductsPage"; // trang liệt kê/tìm kiếm sản phẩm
import Account from "../../views/pages/AccountPage/AccountPage";
import Metronome from "../../views/pages/ToolsPage/MetronomePage/Metronome";
import Songs from "../../views/pages/SongsPage/SongsPage";
import ChordsPage from "../../views/pages/ToolsPage/ChordsPage/ChordsPage";
import SongDetails from "../../views/pages/songDetails/SongDetails";
import FavoritesPage from "../../views/pages/FavoritesPage/FavoritesPage";
import TunerPage from "../../views/pages/TunerPage/TunerPage";
import AdminPage from "../../views/pages/AdminPage/AdminPage";
import AddressPage from "../../views/pages/AddressPage/AddressPage";
const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/products/:slug", element: <ProductDetails /> }, // chi tiết sản phẩm
  { path: "/products", element: <ProductsCategory /> },     // tìm kiếm/lọc sản phẩm theo ?q=&category=&brand=
  { path: "/category/:slug", element: <ViewCategory /> },   // list sản phẩm theo :slug
  { path: "/cart", element: <Cart /> },
  { path: "/favorites", element: <FavoritesPage /> },
  { path: "/checkout", element: <Checkout /> },
  { path: "/checkout-history", element: <CheckOutHistory /> },

  // { path: "/productsCategory", element: <ProductsCategory /> }, // (tuỳ chọn) alias cũ, có thể bỏ
  { path: "/account", element: <Account /> },
  { path: "/addresses", element: <AddressPage /> },
  { path: "/tools/metronome", element: <Metronome /> },
  { path: "/tools/chords", element: <ChordsPage/> },
  { path: "/tools/tuner", element: <TunerPage /> },
  { path: "/admin/*", element: <AdminPage /> },
  { path: "/songs", element: <Songs />},
  { path: "/songs/:slug", element: <SongDetails /> },

];

export default publicRoutes;
