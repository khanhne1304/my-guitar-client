// src/hooks/useProductBySlug.js
import { useEffect, useState } from 'react';
import { productService } from '../services/productService';

export function useProductBySlug(slug) {
  const [prod, setProd] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setErr('');
      try {
        const data = await productService.getBySlug(slug);
        if (!mounted) return;
        setProd(data);
        setImages(Array.isArray(data.images) ? data.images : []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Không tìm thấy sản phẩm');
        setProd(null);
        setImages([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (slug) run();
    return () => {
      mounted = false;
    };
  }, [slug]);

  return { prod, images, loading, err };
}
