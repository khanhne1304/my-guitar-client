// src/hooks/usePrice.js
import { useMemo } from 'react';


export function usePrice(prod) {
return useMemo(() => {
const base = prod?.price?.base ?? 0;
const sale = prod?.price?.sale ?? 0;
const priceNow = sale && sale !== 0 ? sale : base;
const oldPrice = sale && sale !== 0 ? base : null;
const discount = oldPrice ? Math.round((1 - priceNow / oldPrice) * 100) : 0;
return { priceNow, oldPrice, discount };
}, [prod]);
}