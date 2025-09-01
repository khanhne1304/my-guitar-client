// src/hooks/useProductBySlug.js
import { useMemo } from 'react';
import { getProductBySlug } from '../../src/views/components/Data/dataProduct';


export function useProductBySlug(slug) {
const prod = useMemo(() => getProductBySlug(slug), [slug]);
const images = prod?.images?.length ? prod.images : [{ url: '', alt: prod?.name }];
return { prod, images };
}