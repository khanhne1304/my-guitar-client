// ProductDetailsViewModel.js
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../src/context/CartContext';
import { useProductBySlug } from '../hooks/useProductBySlug';
import { useProducts } from '../hooks/useProducts';
import { usePrice } from '../hooks/usePrice';
import { useRelatedProducts } from '../hooks/useRelatedProduct';

const FILE_BASE = import.meta?.env?.VITE_FILE_BASE_URL || 'http://localhost:4000';
const ensureAbsolute = (u) =>
  !u ? '' : /^https?:|^data:/.test(u) ? u : `${FILE_BASE}${u.startsWith('/') ? '' : '/'}${u}`;

export function useProductDetailsViewModel() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { prod, images } = useProductBySlug(slug);
  const { products: headerProducts } = useProducts();
  const { priceNow, oldPrice, discount } = usePrice(prod);
  const related = useRelatedProducts(prod?.category?.slug, prod?.slug);

  const galleryImages = (images?.length ? images : prod?.images || []).map((i) => ({
    url: ensureAbsolute(i?.url),
    alt: i?.alt || prod?.name || 'Ảnh sản phẩm',
  }));

  const handleAddToCart = (qty, goToCart = false) => {
    const user = localStorage.getItem('user');
    if (!user) return navigate('/login');
    if (prod.stock <= 0) return;

    addToCart(
      {
        _id: prod._id,
        slug: prod.slug,
        name: prod.name,
        sku: prod.sku,
        price: priceNow,
        image: prod.images?.[0]?.url || '',
        stock: prod.stock,
      },
      qty
    );

    goToCart ? navigate('/cart') : alert('Đã thêm sản phẩm vào giỏ hàng!');
  };

  return {
    prod,
    headerProducts,
    galleryImages,
    priceNow,
    oldPrice,
    discount,
    related,
    handleAddToCart,
    navigate,
  };
}
