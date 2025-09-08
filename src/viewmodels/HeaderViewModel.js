// src/viewmodels/HeaderViewModel.js
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  buildBrandsByCategory,            // fallback khi API lỗi/không có
  fetchBrandsByCategoryFromAPI,     // ✅ ưu tiên dùng API ổn định
} from "../hooks/useHeader";
// (tuỳ bạn) Nếu vẫn muốn suy brand từ sản phẩm, giữ nguyên:
import { listProducts } from "../services/productService";

/**
 * ViewModel cho Header: quản lý user, giỏ hàng, menu brand, và tìm kiếm.
 * API trả ra giữ nguyên: { state, actions }
 */
export function useHeaderViewModel(products = []) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ===== User =====
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;
    try {
      setUser(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  // ===== Brand menus (tách khỏi products để tránh chớp tắt) =====
  const [guitarBrands, setGuitarBrands] = useState([]); // [{name, slug}]
  const [pianoBrands, setPianoBrands] = useState([]);   // [{name, slug}]

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // Ưu tiên gọi API by-category (ổn định)
        const [g, p] = await Promise.all([
          fetchBrandsByCategoryFromAPI("guitar"),
          fetchBrandsByCategoryFromAPI("piano"),
        ]);

        if (!alive) return;
        setGuitarBrands(Array.isArray(g) ? g : []);
        setPianoBrands(Array.isArray(p) ? p : []);
      } catch {
        // Fallback: nếu API không khả dụng → suy từ products (nếu có)
        if (!alive) return;

        if (Array.isArray(products) && products.length) {
          const grouped = buildBrandsByCategory(products);
          const guitar = Array.from(grouped?.guitar ?? []).map((n) => ({
            name: n,
            slug: n,
          }));
          const piano = Array.from(grouped?.piano ?? []).map((n) => ({
            name: n,
            slug: n,
          }));
          setGuitarBrands(guitar);
          setPianoBrands(piano);
        } else {
          setGuitarBrands([]);
          setPianoBrands([]);
        }
      }
    })();

    return () => {
      alive = false;
    };
    // ❗ Không phụ thuộc searchParams để tránh clear brand khi đổi URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  // ===== Search & URL sync =====
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") ?? ""
  );
  const [brandFilter, setBrandFilter] = useState(
    searchParams.get("brand") ?? ""
  );

  // Khi URL đổi (click menu), đồng bộ lại input trong Header
  useEffect(() => {
    setKeyword(searchParams.get("q") ?? "");
    setCategoryFilter(searchParams.get("category") ?? "");
    setBrandFilter(searchParams.get("brand") ?? "");
  }, [searchParams]);

  // ✅ Dùng navigate (PUSH) — back sẽ hoạt động bình thường
  const submitSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (categoryFilter) params.set("category", categoryFilter);
    if (brandFilter) params.set("brand", brandFilter);

    // ⚠️ Sửa bug template string: cần backtick
    navigate(`/products?${params.toString()}`);
  }, [navigate, keyword, categoryFilter, brandFilter]);

  const onSearchKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") submitSearch();
    },
    [submitSearch]
  );

  const { cartCount } = useCart();

  const goHome = useCallback(() => navigate("/"), [navigate]);
  const goCart = useCallback(() => navigate("/cart"), [navigate]);
  const goLogin = useCallback(() => navigate("/login"), [navigate]);
  const goRegister = useCallback(() => navigate("/register"), [navigate]);
  const goAccount = useCallback(() => navigate("/account"), [navigate]);

  return {
    state: {
      user,
      cartCount,
      keyword,
      categoryFilter,
      brandFilter,
      // Brand mảng object {name, slug}
      guitarBrands,
      pianoBrands,
    },
    actions: {
      setKeyword,
      setCategoryFilter,
      setBrandFilter,
      submitSearch,
      onSearchKeyDown,
      goHome,
      goCart,
      goLogin,
      goRegister,
      goAccount,
      handleLogout,
    },
  };
}
