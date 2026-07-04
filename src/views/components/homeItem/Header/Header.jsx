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

export default function Header() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Brands
  const { brands, loading, loadBrandsFor } = useBrands();
  useEffect(() => {
    loadBrandsFor("guitar");
  }, []);

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
