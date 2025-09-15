// routeConfig/publicRoute.jsx
import Home from "../../views/pages/HomePage/HomePage";
import Register from "../../views/pages/RegisterPage/RegisterPage";
import Login from "../../views/pages/LoginPage/LoginPage";
import ProductDetails from "../../views/pages/ProductDetailsPage/ProductDetailsPage";
import ViewCategory from "../../views/pages/CategoryPage/CategoryPage";
import Cart from "../../views/pages/CartPage/CartPage";
import Checkout from "../../views/pages/CheckoutPage/CheckoutPage";
import ProductsCategory from "../../views/pages/ProductsPage/ProductsPage"; // trang liệt kê Category
import Account from "../../views/pages/AccountPage/AccountPage";
import Metronome from "../../views/pages/ToolsPage/MetronomePage/Metronome";
import Songs from "../../views/pages/SongsPage/SongsPage";
import ChordsPage from "../../views/pages/ToolsPage/ChordsPage/ChordsPage";
import SongDetails from "../../views/pages/songDetails/SongDetails";

const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/products/:slug", element: <ProductDetails /> }, // chi tiết sản phẩm
  { path: "/products", element: <ViewCategory /> },         // list sản phẩm theo ?category=...
  { path: "/category/:slug", element: <ViewCategory /> },   // list sản phẩm theo :slug
  { path: "/cart", element: <Cart /> },
  { path: "/checkout", element: <Checkout /> },
  { path: "/productsCategory", element: <ProductsCategory /> }, // ✅ list Category
  { path: "/account", element: <Account /> },
  { path: "/tools/metronome", element: <Metronome /> },
  { path: "/tools/chords", element: <ChordsPage/> },
  { path: "/songs", element: <Songs />},
  { path: "/songs/:slug", element: <SongDetails /> },

];

export default publicRoutes;
