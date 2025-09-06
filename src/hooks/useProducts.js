// src/hooks/useProducts.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { productService } from '../services/productService';

export function useProducts(initialParams = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const paramsRef = useRef(initialParams);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const items = await productService.list(paramsRef.current);
      setProducts(Array.isArray(items) ? items : []);
    } catch (e) {
      setErr(e?.message || 'Không thể tải sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refetch = useCallback(
    (nextParams) => {
      if (nextParams && typeof nextParams === 'object') {
        paramsRef.current = { ...paramsRef.current, ...nextParams };
      }
      fetchProducts();
    },
    [fetchProducts],
  );

  return { products, loading, err, refetch };
}
