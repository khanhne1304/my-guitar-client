// src/utils/catalog.js
export function buildCategoriesFromProducts(products, covers, fallback) {
const map = new Map();
for (const p of products || []) {
const slug = p?.category?.slug;
const name = p?.category?.name;
if (!slug || !name) continue;


if (!map.has(slug)) {
const cover = covers?.[slug] || p?.images?.[0]?.url || fallback;
map.set(slug, { slug, name, cover, count: 1 });
} else {
const item = map.get(slug);
item.count += 1;
}
}
return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
}