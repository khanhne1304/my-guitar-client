// src/services/statisticsService.js
import { apiClient } from './apiClient';

export async function getStatisticsApi() {
  try {
    const data = await apiClient.get('/admin/statistics');
    return data;
  } catch (err) {
    console.error('❌ getStatisticsApi failed:', err);
    throw err;
  }
}

