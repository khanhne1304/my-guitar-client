import { apiClient } from './apiClient';

export async function listPublicBanners() {
  return apiClient.get('/banners');
}

export async function listAdminBanners() {
  return apiClient.get('/admin/banners');
}

export async function createBanner(payload) {
  return apiClient.post('/admin/banners', payload);
}

export async function updateBanner(id, payload) {
  return apiClient.put(`/admin/banners/${id}`, payload);
}

export async function deleteBanner(id) {
  return apiClient.delete(`/admin/banners/${id}`);
}
