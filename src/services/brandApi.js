import { apiClient } from './apiClient';

export async function listBrands() {
  return apiClient.get('/brands');
}

export async function createBrand(payload) {
  return apiClient.post('/brands', payload);
}

export async function updateBrand(id, payload) {
  return apiClient.patch(`/brands/${id}`, payload);
}

export async function deleteBrand(id) {
  return apiClient.delete(`/brands/${id}`);
}
