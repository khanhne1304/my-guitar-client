// src/context/FavoritesContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getMyFavorites,
  addToFavorites as apiAdd,
  removeFromFavorites as apiRemove,
  toggleFavorite as apiToggle,
} from "../services/favoriteService";
import { getUser, getToken } from "../utils/storage";

const FavoritesContext = createContext();

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
};

// ---- Chuẩn hóa dữ liệu để tránh mất ảnh / slug ----
const normalizeProduct = (p) => ({
  id: p._id || p.id,
  name: p.name,
  brand: p.brand,
  model: p.model,
  price: p.price,
  oldPrice: p.oldPrice,
  image: Array.isArray(p.images) ? p.images[0] : p.image,
  slug: p.slug,
});

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = getUser();
  const token = getToken();

  // ---- Load favorites từ BE hoặc localStorage ----
  async function loadFavorites() {
    if (token && user?.id) {
      try {
        setLoading(true);
        const res = await getMyFavorites();
        const mapped = (res.data?.data || []).map((f) =>
          normalizeProduct(f.product || f)
        );
        setFavorites(mapped);
      } catch (err) {
        console.error("Load favorites error:", err);
        setFavorites([]); // fallback
      } finally {
        setLoading(false);
      }
    } else {
      // Guest: đọc từ localStorage nếu có
      const raw = localStorage.getItem("favorites_guest");
      setFavorites(raw ? JSON.parse(raw) : []);
    }
  }

// src/context/FavoritesContext.jsx
useEffect(() => {
  async function fetchData() {
    if (token && user?.id) {
      try {
        setLoading(true);
        const res = await getMyFavorites();
        // chuẩn hóa để đảm bảo FE luôn có image, slug
        const mapped = res.data.map(f => ({
          id: f.product._id,
          name: f.product.name,
          slug: f.product.slug,
          price: f.product.price,
          brand: f.product.brand,
          image: f.product.images?.[0] || '/no-image.png',
        }));
        setFavorites(mapped);
      } catch (err) {
        console.error("Load favorites error", err);
      } finally {
        setLoading(false);
      }
    }
  }
  fetchData();
}, [user?.id, token]);


  // ---- Lưu cho guest khi favorites thay đổi ----
  useEffect(() => {
    if (!token) {
      localStorage.setItem("favorites_guest", JSON.stringify(favorites));
    }
  }, [favorites, token]);

  // ---- Add ----
  const addToFavorites = async (product) => {
    const data = normalizeProduct(product);
    setFavorites((prev) => {
      if (prev.some((x) => x.id === data.id)) return prev;
      return [...prev, data];
    });
    if (token) {
      try {
        await apiAdd(data.id);
      } catch (err) {
        console.error(err);
        setFavorites((prev) => prev.filter((p) => p.id !== data.id)); // rollback
      }
    }
  };

  // ---- Remove ----
  const removeFromFavorites = async (id) => {
    setFavorites((prev) => prev.filter((p) => p.id !== id));
    if (token) {
      try {
        await apiRemove(id);
      } catch (err) {
        console.error(err);
        loadFavorites(); // rollback
      }
    }
  };

  // ---- Clear ----
  const clearFavorites = async () => {
    setFavorites([]);
    if (token) {
      try {
        // Nếu có endpoint clearAllFavorites thì gọi ở đây
        // await apiClearAllFavorites();
      } catch (err) {
        console.error(err);
        loadFavorites(); // rollback
      }
    } else {
      localStorage.removeItem("favorites_guest");
    }
  };

  // ---- Toggle ----
  const toggleFavorite = async (product) => {
  const data = normalizeProduct(product);
  const exists = favorites.some((x) => x.id === data.id);

  // Optimistic update
  if (exists) {
    setFavorites(prev => prev.filter(x => x.id !== data.id));
  } else {
    setFavorites(prev => [...prev, data]);
  }

  try {
    await apiToggle(data.id);
  } catch (err) {
    console.error("Toggle favorite error", err);
    // rollback: reload lại từ server để đồng bộ chính xác
    loadFavorites();
  }
};


  const isFavorite = (id) =>
    favorites.some((p) => p.id === id || p._id === id || p.product?._id === id);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        clearFavorites,
        toggleFavorite,
        isFavorite,
        loading,
        reloadFavorites: loadFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
