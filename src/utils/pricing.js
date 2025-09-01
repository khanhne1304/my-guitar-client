// src/utils/pricing.js
export function derivePriceShape(p) {
// Hỗ trợ 2 kiểu: { price: { base, sale } } hoặc { price, oldPrice }
if (p?.price && typeof p.price === 'object' && ('base' in p.price)) {
const hasSale = p.price?.sale && p.price.sale !== 0;
const now = hasSale ? p.price.sale : p.price.base;
const old = hasSale ? p.price.base : null;
const discount = old ? Math.round((1 - now / old) * 100) : 0;
return { priceNow: now, oldPrice: old, discount };
}
const now = p?.price ?? 0;
const old = p?.oldPrice && p.oldPrice > now ? p.oldPrice : null;
const discount = old ? Math.round((1 - now / old) * 100) : 0;
return { priceNow: now, oldPrice: old, discount };
}


export function topDiscounts(items = [], n = 3) {
return items
.map((p) => {
const { discount } = derivePriceShape(p);
return { ...p, _discount: discount };
})
.filter((p) => p._discount > 0)
.sort((a, b) => b._discount - a._discount)
.slice(0, n)
.map((p) => ({ ...p, name: `${p.name} • -${p._discount}%` }));
}