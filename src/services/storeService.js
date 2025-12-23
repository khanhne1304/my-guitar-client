// src/services/storeService.js
import { apiClient } from './apiClient';

export async function listStores() {
  try {
    const data = await apiClient.get('/stores');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('listStores failed', e);
    return [];
  }
}


