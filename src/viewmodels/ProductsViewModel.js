// ProductsViewModel.js
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';

export function useProductsViewModel() {
  const navigate = useNavigate();

  // Lấy danh mục từ API sản phẩm (tuỳ bạn có API categories riêng thì dùng thẳng)
  const { products } = useProducts();

  // Suy danh mục từ products (name/slug trong product.category)
  const categories = Array.from(
    new Map(
      (products || [])
        .map((p) => p?.category)
        .filter((c) => c && c.slug && c.name)
        .map((c) => [c.slug, { slug: c.slug, name: c.name }]),
    ).values(),
  );

  const handleSelect = (slug) => {
    navigate(`/products?category=${encodeURIComponent(slug)}`);
  };

  return {
    products,
    categories,
    handleSelect,
  };
}
