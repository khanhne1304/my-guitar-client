// src/hooks/useCategoriesFromProducts.js
import { useMemo } from 'react';
import { buildCategoriesFromProducts } from '../utils/catalog';
import { CATEGORY_COVERS, FALLBACK_COVER } from '../Constants/categoryCover';


export function useCategoriesFromProducts(products, overrides) {
const covers = { ...CATEGORY_COVERS, ...(overrides || {}) };
return useMemo(
() => buildCategoriesFromProducts(products, covers, FALLBACK_COVER),
[products, covers]
);
}