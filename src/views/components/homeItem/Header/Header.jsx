import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../../../context/CartContext";
import styles from "./Header.module.css";
import Logo from "./Logo";
import Menu from "./Menu";
import SearchBox from "./SearchBox";
import AuthButtons from "./AuthButtons";
import { useBrands } from "../../../../hooks/useBrands";
import { useAuth } from "../../../../context/AuthContext";
import { clearSession } from "../../../../utils/storage";

export default function Header() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logout } = useAuth();

  // User state
  const [user, setUser] = useState(null);
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    // Xoá session lưu trữ và cập nhật AuthContext
    clearSession();
    logout();
    setUser(null);
    navigate("/login");
  };

  // Brands
  const { brands, loading, loadBrandsFor } = useBrands();
  useEffect(() => {
    // Chỉ load một lần khi component mount
    loadBrandsFor("guitar");
  }, []); // Bỏ dependency loadBrandsFor để tránh re-render

  // Search state
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [categoryFilter] = useState(searchParams.get("category") ?? "");
  const [brandFilter] = useState(searchParams.get("brand") ?? "");

  const submitSearch = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (categoryFilter) params.set("category", categoryFilter);
    if (brandFilter) params.set("brand", brandFilter);
    setSearchParams(params);
    navigate(`/products?${params.toString()}`);
  };

  // Cart context
  const { cartCount } = useCart();

  return (
    <header className={styles.home__navbar}>
      <Logo />
      <Menu brands={brands} loading={loading} loadBrandsFor={loadBrandsFor} />
      <SearchBox
        keyword={keyword}
        setKeyword={setKeyword}
        submitSearch={submitSearch}
      />
      <AuthButtons
        user={user}
        cartCount={cartCount}
        handleLogout={handleLogout}
      />
    </header>
  );
}
