import { useState, useCallback, useRef } from "react";
import { categoryService } from "../services/categoryService";
import { productService } from "../services/productService";

// Global cache để tránh gọi API trùng lặp
const globalBrandsCache = new Map();
const globalLoadingCache = new Set();

export function useBrands() {
  const [brands, setBrands] = useState({});
  const [loading, setLoading] = useState({});
  const loadedCategoriesRef = useRef(new Set());

  const deriveBrandsFromProducts = (items = []) => {
    const map = new Map();
    items.forEach((p) => {
      const b = p?.brand;
      if (!b) return;
      const name = typeof b === "string" ? b : b.name || "";
      const slug = b?.slug || name.toLowerCase().trim().replace(/\s+/g, "-");
      if (name && slug && !map.has(slug)) map.set(slug, { name, slug });
    });
    return Array.from(map.values());
  };

  const loadBrandsFor = useCallback(async (slug) => {
    if (!slug) return;
    
    // Kiểm tra global cache trước
    if (globalBrandsCache.has(slug)) {
      setBrands((s) => ({ ...s, [slug]: globalBrandsCache.get(slug) }));
      return;
    }
    
    // Kiểm tra xem đang loading không
    if (globalLoadingCache.has(slug)) {
      return;
    }
    
    setLoading((s) => ({ ...s, [slug]: true }));
    loadedCategoriesRef.current.add(slug);
    globalLoadingCache.add(slug);
    
    try {
      const apiBrands = await categoryService.listBrandsBySlug(slug);
      
      let finalBrands = [];
      if (apiBrands?.length) {
        finalBrands = apiBrands;
      } else {
        const prods = await productService.list({ categorySlug: slug });
        finalBrands = deriveBrandsFromProducts(prods);
      }
      
      // Lưu vào global cache
      globalBrandsCache.set(slug, finalBrands);
      setBrands((s) => ({ ...s, [slug]: finalBrands }));
      
    } catch (error) {
      // Try fallback even on error
      try {
        const prods = await productService.list({ categorySlug: slug });
        const derivedBrands = deriveBrandsFromProducts(prods);
        
        // Lưu vào global cache
        globalBrandsCache.set(slug, derivedBrands);
        setBrands((s) => ({ ...s, [slug]: derivedBrands }));
      } catch (fallbackError) {
        globalBrandsCache.set(slug, []);
        setBrands((s) => ({ ...s, [slug]: [] }));
      }
    } finally {
      setLoading((s) => ({ ...s, [slug]: false }));
      globalLoadingCache.delete(slug);
    }
  }, []);

  return { brands, loading, loadBrandsFor };
}
