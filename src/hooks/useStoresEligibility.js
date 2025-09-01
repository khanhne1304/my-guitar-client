// src/hooks/useStoresEligibility.js
import { useMemo } from 'react';
export function useStoresEligibility(cartItems = [], stores = []) {
const eligibleStores = useMemo(() => {
if (!cartItems.length) return [];
return (stores || []).filter((s) =>
cartItems.every((it) => (s.inventory[it.slug] || 0) >= it.qty)
);
}, [cartItems, stores]);


return { eligibleStores };
}