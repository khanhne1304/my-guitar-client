// routeConfig/publicRoute.jsx
import Home from "../../views/pages/HomePage/Home";
import Register from "../../views/pages/RegisterPage/Register";
import Login from "../../views/pages/LoginPage/Login";
import ProductDetails from "../../views/pages/productDetails/productDetails";
import ViewCategory from "../../views/pages/CategoryPage/viewCategory";
import Cart from "../../views/pages/CartPage/Cart";
import Checkout from "../../views/pages/CheckoutPage/Checkout";
import ProductsCategory from "../../views/pages/ProductsPage/Products"; // trang liệt kê Category

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
];

export default publicRoutes;
