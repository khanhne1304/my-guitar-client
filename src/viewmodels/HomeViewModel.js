// HomeViewModel.js
import { useProducts } from '../hooks/useProducts';
import { topDiscounts } from '../utils/pricing';
import { HomeState } from '../models/homeModel';

export function useHomeViewModel() {
  const { products, loading, err } = useProducts();

  const state = new HomeState({ products, loading, err });

  // Lấy top 3 sản phẩm giảm giá
  const discountedTop3 = topDiscounts(state.products, 3);

  return {
    products: state.products,
    loading: state.loading,
    err: state.err,
    discountedTop3,
  };
}
