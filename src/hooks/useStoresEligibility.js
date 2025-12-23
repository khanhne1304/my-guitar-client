// src/hooks/useStoresEligibility.js
import { useMemo } from 'react';
export function useStoresEligibility(cartItems = [], stores = []) {
	const eligibleStores = useMemo(() => {
		// Nếu giỏ hàng trống, hiển thị toàn bộ cửa hàng để người dùng vẫn chọn được
		if (!cartItems?.length) return stores || [];
		const filtered = (stores || []).filter((s) =>
			cartItems.every((it) => ((s.inventory || {})[it.slug] || 0) >= (it.qty || 0)),
		);
		// Nếu không có cửa hàng nào đủ tồn, fallback: hiển thị toàn bộ để user vẫn chọn điểm nhận
		return filtered.length ? filtered : (stores || []);
	}, [cartItems, stores]);

	return { eligibleStores };
}