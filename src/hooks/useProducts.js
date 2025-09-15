// src/hooks/useProducts.js
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { productService } from '../services/productService';

export function useProducts(initialParams = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  
  // Memoize params để tránh re-render không cần thiết
  const memoizedParams = useMemo(() => initialParams, [
    initialParams.categorySlug,
    initialParams.brandSlug,
    initialParams.q,
    initialParams.sortBy
  ]);
  
  const paramsRef = useRef(null);

  const fetchProducts = useCallback(async (params) => {
    console.log('🔄 Fetching products with params:', params);
    setLoading(true);
    setErr('');
    try {
      const items = await productService.list(params);
      console.log('✅ Products fetched:', items);
      setProducts(Array.isArray(items) ? items : []);
    } catch (e) {
      console.error('❌ Error fetching products:', e);
      setErr(e?.message || 'Không thể tải sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Single useEffect để handle cả initial call và updates
  useEffect(() => {
    const hasParamsChanged = JSON.stringify(paramsRef.current) !== JSON.stringify(memoizedParams);
    
    console.log('🔍 Params check:', {
      current: paramsRef.current,
      new: memoizedParams,
      changed: hasParamsChanged,
      isFirstCall: paramsRef.current === null
    });
    
    if (hasParamsChanged || paramsRef.current === null) {
      paramsRef.current = memoizedParams;
      fetchProducts(memoizedParams);
    }
  }, [memoizedParams, fetchProducts]);

  const refetch = useCallback(
    (nextParams) => {
      const newParams = { ...paramsRef.current, ...nextParams };
      paramsRef.current = newParams;
      fetchProducts(newParams);
    },
    [fetchProducts],
  );

  return { products, loading, err, refetch };
}
