// src/services/productService.js
import { apiClient } from './apiClient';

// Dùng helper từ apiClient nếu có, nếu chưa có thì fallback giữ nguyên chuỗi
const makeAbs = apiClient.ensureAbsolute ?? ((u) => u);

// Helper: build query string
const toQuery = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, v);
  });
  return qs.toString() ? `?${qs}` : '';
};

// Chuẩn hoá dữ liệu sản phẩm
const normalizeProduct = (p) => {
  const first = p?.images?.[0] || {};
  const raw = p?.image || p?.thumbnail || first?.url || p?.cover || '';
  return {
    ...p,
    image: makeAbs(raw),
    imageAlt: first?.alt || p?.name || '',
    images: Array.isArray(p?.images)
      ? p.images.map((i) => ({ ...i, url: makeAbs(i?.url) }))
      : [],
  };
};

export const productService = {
  async list(params = {}) {
    const data = await apiClient.get(`/products${toQuery(params)}`);
    const items = Array.isArray(data) ? data : data?.items ?? [];
    return items.map(normalizeProduct);
  },

  async getBySlug(slug) {
    if (!slug) throw new Error('slug is required');
    const data = await apiClient.get(`/products/${slug}`);
    return normalizeProduct(data);
  },
};
