// src/hooks/useRelatedProducts.js
import { useEffect, useState } from 'react';
import { productService } from '../services/productService';

export function useRelatedProducts(categorySlug, currentSlug, limit = 4) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categorySlug) return;
    setLoading(true);

    productService
      .listByCategory(categorySlug)
      .then((items) => {
        // Lọc bỏ sản phẩm đang xem
        const filtered = items.filter((p) => p.slug !== currentSlug);
        setRelated(filtered.slice(0, limit));
      })
      .catch(() => setRelated([]))
      .finally(() => setLoading(false));
  }, [categorySlug, currentSlug, limit]);

  return { related, loading };
}
