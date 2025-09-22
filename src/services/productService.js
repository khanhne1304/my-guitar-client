// src/services/productService.js
import { apiClient } from './apiClient';

// Fallback image khi sản phẩm không có ảnh
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop";

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

// Chuẩn hoá dữ liệu sản phẩm + fallback image
const normalizeProduct = (p) => {
  const first = p?.images?.[0] || {};
  const raw = p?.image || p?.thumbnail || first?.url || p?.cover || DEFAULT_IMAGE;

  return {
    ...p,
    image: makeAbs(raw || DEFAULT_IMAGE), // 👈 luôn có ảnh fallback
    imageAlt: first?.alt || p?.name || '',
    images: Array.isArray(p?.images)
      ? p.images.map((i) => ({
          ...i,
          url: makeAbs(i?.url || DEFAULT_IMAGE),
        }))
      : [{ url: DEFAULT_IMAGE, alt: p?.name || 'No image' }],
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

  async create(data) {
    const res = await apiClient.post('/products', data);
    return normalizeProduct(res);
  },

  async update(id, data) {
    const res = await apiClient.patch(`/products/${id}`, data);
    return normalizeProduct(res);
  },

  async delete(id) {
    return apiClient.delete(`/products/${id}`);
  },
};
