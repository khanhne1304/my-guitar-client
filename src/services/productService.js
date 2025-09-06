// src/services/productService.js
import { apiClient } from './apiClient';

const FILE_BASE =
  import.meta?.env?.VITE_FILE_BASE_URL || 'http://localhost:4000';

function ensureAbsolute(u) {
  if (!u) return '';
  const s = String(u);
  const low = s.toLowerCase();
  if (
    low.startsWith('http://') ||
    low.startsWith('https://') ||
    low.startsWith('data:')
  )
    return s;
  return `${FILE_BASE}${s.startsWith('/') ? '' : '/'}${s}`;
}

function toQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

function normalizeProduct(p) {
  const first = p?.images?.[0] || {};
  const raw = p.image || p.thumbnail || first.url || p.cover || '';
  return {
    ...p,
    image: ensureAbsolute(raw),
    imageAlt: first.alt || p.name || '',
    images: Array.isArray(p.images)
      ? p.images.map((i) => ({ ...i, url: ensureAbsolute(i?.url) }))
      : [],
  };
}

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
