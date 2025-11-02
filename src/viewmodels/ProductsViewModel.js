// ProductsViewModel.js
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';

export function useProductsViewModel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Đọc params tìm kiếm và filter từ URL
  const q = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const brandSlug = searchParams.get('brand') || '';
  const sortBy = searchParams.get('sortBy') || '';

  // Gọi API sản phẩm với params hiện tại (lấy nhiều item để phân trang phía client)
  const { products, loading, err } = useProducts({ q, categorySlug, brandSlug, sortBy, limit: 1000 });

  // Xác định khi nào đang ở chế độ tìm kiếm/lọc
  const isFiltered = Boolean(q || categorySlug || brandSlug);

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
    loading,
    err,
    categories,
    isFiltered,
    q,
    categorySlug,
    brandSlug,
    handleSelect,
  };
}
