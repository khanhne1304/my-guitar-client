import { apiClient } from './apiClient';

export function listCustomPathsApi() {
  return apiClient.get('/learning/custom-paths').then((r) => r.paths || []);
}

export function getCustomPathApi(pathId) {
  return apiClient.get(`/learning/custom-paths/${pathId}`);
}

export function createCustomPathApi(body) {
  return apiClient.post('/learning/custom-paths', body);
}

export function updateCustomPathApi(pathId, body) {
  return apiClient.put(`/learning/custom-paths/${pathId}`, body);
}

export function deleteCustomPathApi(pathId) {
  return apiClient.delete(`/learning/custom-paths/${pathId}`);
}
