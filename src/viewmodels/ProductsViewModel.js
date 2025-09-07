// ProductsViewModel.js
import { useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../../src/views/components/Data/dataProduct';
import { useCategoriesFromProducts } from '../../src/hooks/useCategoriesFromProducts';

export function useProductsViewModel() {
  const navigate = useNavigate();

  // Lấy danh mục từ danh sách sản phẩm
  const categories = useCategoriesFromProducts(MOCK_PRODUCTS);

  const handleSelect = (slug) => {
    navigate(`/products?category=${encodeURIComponent(slug)}`);
  };

  return {
    products: MOCK_PRODUCTS,
    categories,
    handleSelect,
  };
}
