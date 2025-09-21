// HomeViewModel.js
import { useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { topDiscounts } from '../utils/pricing';
import { HomeState } from '../models/homeModel';
import { useCategory } from '../context/CategoryContext';

export function useHomeViewModel() {
  const { selectedCategory, selectedBrand } = useCategory();
  
  // Memoize params để tránh tạo object mới mỗi lần render
  const apiParams = useMemo(() => {
    const params = {};
    if (selectedCategory) {
      params.categorySlug = selectedCategory;
    }
    if (selectedBrand) {
      params.brandSlug = selectedBrand;
    }
    return params;
  }, [selectedCategory, selectedBrand]);

  const { products, loading, err } = useProducts(apiParams);

  const state = new HomeState({ products, loading, err });

  // Lấy top 3 sản phẩm giảm giá
  const discountedTop3 = topDiscounts(state.products, 3);

  return {
    products: state.products,
    loading: state.loading,
    err: state.err,
    discountedTop3,
    selectedCategory,
    selectedBrand,
  };
}
