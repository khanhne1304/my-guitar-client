// src/hooks/useRelatedProducts.js
import { useMemo } from 'react';
import { getProductsByCategory } from '../../src/views/components/Data/dataProduct';


export function useRelatedProducts(categorySlug, currentSlug, limit = 4) {
return useMemo(() => {
const list = getProductsByCategory(categorySlug) || [];
return list.filter((p) => p.slug !== currentSlug).slice(0, limit);
}, [categorySlug, currentSlug, limit]);
}