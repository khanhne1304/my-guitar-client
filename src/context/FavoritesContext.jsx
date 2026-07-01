// src/context/FavoritesContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getMyFavorites,
  addToFavorites as apiAdd,
  removeFromFavorites as apiRemove,
  toggleFavorite as apiToggle,
} from "../services/favoriteService";
import { getUser, getToken } from "../utils/storage";
import {
  getStoredFavorites,
  setStoredFavorites,
  clearStoredFavorites,
  resolveUserId,
} from "../utils/favoriteStorage";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
};

const normalizeProduct = (p) => {
  if (!p) return null;

  let image = '';
  if (Array.isArray(p.images) && p.images.length > 0) {
    image = p.images[0].url || p.images[0];
  } else if (p.image) {
    image = p.image;
  } else if (p.thumbnail) {
    image = p.thumbnail;
  } else if (p.cover) {
    image = p.cover;
  }

  const id = p._id || p.id;
  if (!id) return null;

  return {
    id,
    name: p.name,
    brand: p.brand,
    model: p.model,
    price: p.price,
    oldPrice: p.oldPrice,
    image,
    slug: p.slug,
  };
};

const readAuthSnapshot = (authUser) => {
  const user = authUser || getUser();
  const token = getToken();
  const userId = resolveUserId(user);
  return { token, userId };
};

export const FavoritesProvider = ({ children }) => {
  const { user: authUser, authChecked } = useAuth();

  const [favorites, setFavorites] = useState(() => {
    const { token, userId } = readAuthSnapshot(null);
    return getStoredFavorites(token && userId ? userId : null);
  });
  const [loading, setLoading] = useState(false);

  const persistFavorites = useCallback((items, token, userId) => {
    if (token && userId) {
      setStoredFavorites(items, userId);
      return;
    }
    if (!token) {
      setStoredFavorites(items, null);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    const { token, userId } = readAuthSnapshot(authUser);

    if (token && userId) {
      try {
        setLoading(true);
        const res = await getMyFavorites();
        const mapped = (res?.data || [])
          .map((f) => normalizeProduct(f.product || f))
          .filter(Boolean);
        setFavorites(mapped);
        setStoredFavorites(mapped, userId);
      } catch (err) {
        console.error("Load favorites error:", err);
        const cached = getStoredFavorites(userId);
        if (cached.length > 0) {
          setFavorites(cached);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    const cached = getStoredFavorites(null);
    setFavorites(cached);
  }, [authUser]);

  useEffect(() => {
    if (!authChecked) return;
    loadFavorites();
  }, [authChecked, authUser, loadFavorites]);

  useEffect(() => {
    const { token, userId } = readAuthSnapshot(authUser);
    persistFavorites(favorites, token, userId);
  }, [favorites, authUser, persistFavorites]);

  const addToFavorites = async (product) => {
    const data = normalizeProduct(product);
    if (!data) return;

    setFavorites((prev) => {
      if (prev.some((x) => x.id === data.id)) return prev;
      return [...prev, data];
    });

    const { token } = readAuthSnapshot(authUser);
    if (!token) return;

    try {
      await apiAdd(data.id);
    } catch (err) {
      console.error(err);
      setFavorites((prev) => prev.filter((p) => p.id !== data.id));
    }
  };

  const removeFromFavorites = async (id) => {
    setFavorites((prev) => prev.filter((p) => p.id !== id));

    const { token } = readAuthSnapshot(authUser);
    if (!token) return;

    try {
      await apiRemove(id);
    } catch (err) {
      console.error(err);
      loadFavorites();
    }
  };

  const clearFavorites = async () => {
    const { token, userId } = readAuthSnapshot(authUser);
    setFavorites([]);

    if (token && userId) {
      clearStoredFavorites(userId);
      return;
    }

    clearStoredFavorites(null);
  };

  const toggleFavorite = async (product) => {
    const data = normalizeProduct(product);
    if (!data) return;

    const exists = favorites.some((x) => x.id === data.id);

    if (exists) {
      setFavorites((prev) => prev.filter((x) => x.id !== data.id));
    } else {
      setFavorites((prev) => [...prev, data]);
    }

    const { token } = readAuthSnapshot(authUser);
    if (!token) return;

    try {
      await apiToggle(data.id);
    } catch (err) {
      console.error("Toggle favorite error", err);
      loadFavorites();
    }
  };

  const isFavorite = (id) =>
    favorites.some((p) => p.id === id || p._id === id || p.product?._id === id);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoritesCount: favorites.length,
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
