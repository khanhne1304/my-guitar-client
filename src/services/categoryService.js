// src/services/categoryService.js
import { apiClient } from './apiClient';

export const categoryService = {
  async listBrandsBySlug(slug) {
    if (!slug) throw new Error('slug is required');
    const data = await apiClient.get(`/categories/${encodeURIComponent(slug)}/brands`);
    // Chuẩn hoá: trả [{name, slug}]
    return Array.isArray(data)
      ? data.map((b) => ({ name: b?.name || '', slug: b?.slug || '' }))
      : [];
  },
};


