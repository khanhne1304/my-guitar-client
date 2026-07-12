import { apiClient } from './apiClient';

export const referenceSongService = {
  /**
   * Lấy danh sách bài hát gốc công khai (public, chỉ bài isActive = true)
   */
  async listPublic(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.set(key, value);
      }
    });
    const query = search.toString() ? `?${search.toString()}` : '';
    const response = await apiClient.get(`/reference-songs/public${query}`);
    return response?.data;
  },
};

export default referenceSongService;
