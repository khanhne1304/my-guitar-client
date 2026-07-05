// HomeViewModel.js
import { useProducts } from '../hooks/useProducts';
import { topDiscounts } from '../utils/pricing';
import { HomeState } from '../models/homeModel';

export function useHomeViewModel() {
  const { products, loading, err } = useProducts({ limit: 100 });

  const state = new HomeState({ products, loading, err });
  const discountedTop3 = topDiscounts(state.products, 3);

  return {
    products: state.products,
    loading: state.loading,
    err: state.err,
    discountedTop3,
  };
}
