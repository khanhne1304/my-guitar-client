import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const selectCategory = useCallback((categorySlug) => {
    setSelectedCategory(categorySlug);
    setSelectedBrand(null); // Reset brand when category changes
  }, []);

  const selectBrand = useCallback((brandSlug) => {
    setSelectedBrand(brandSlug);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedBrand(null);
  }, []);

  const value = useMemo(() => ({
    selectedCategory,
    selectedBrand,
    selectCategory,
    selectBrand,
    clearFilters,
  }), [selectedCategory, selectedBrand, selectCategory, selectBrand, clearFilters]);

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
}
