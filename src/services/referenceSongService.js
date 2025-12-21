import { apiClient } from './apiClient';

export const referenceSongService = {
  /**
   * Lấy danh sách bài hát gốc (admin only)
   */
  async list(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.set(key, value);
      }
    });
    const query = search.toString() ? `?${search.toString()}` : '';
    const response = await apiClient.get(`/admin/reference-songs${query}`);
    return response?.data;
  },

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

  /**
   * Lấy thông tin một bài hát gốc
   */
  async get(id) {
    const response = await apiClient.get(`/admin/reference-songs/${id}`);
    return response?.data;
  },

  /**
   * Tạo bài hát gốc mới (upload audio)
   */
  async create({ audioFile, title, description, artist, tempo, timeSignature, key, difficulty, tags }) {
    if (!audioFile) {
      throw new Error('File audio là bắt buộc.');
    }
    if (!title || !title.trim()) {
      throw new Error('Tiêu đề bài hát là bắt buộc.');
    }

    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('title', title.trim());
    if (description) formData.append('description', description.trim());
    if (artist) formData.append('artist', artist.trim());
    if (tempo) formData.append('tempo', String(tempo));
    if (timeSignature) formData.append('timeSignature', timeSignature);
    if (key) formData.append('key', key.trim());
    if (difficulty) formData.append('difficulty', difficulty);
    if (tags) {
      if (Array.isArray(tags)) {
        formData.append('tags', tags.join(','));
      } else if (typeof tags === 'string' && tags.trim()) {
        formData.append('tags', tags.trim());
      }
    }

    try {
      const response = await apiClient.post('/admin/reference-songs', formData, {
        headers: {},
      });
      return response?.data || response;
    } catch (error) {
      // Re-throw với thông tin chi tiết hơn
      const message = error?.response?.data?.message || 
                     error?.data?.message || 
                     error?.message || 
                     'Không thể tạo bài hát gốc';
      const enhancedError = new Error(message);
      enhancedError.response = error?.response;
      enhancedError.data = error?.data;
      throw enhancedError;
    }
  },

  /**
   * Cập nhật thông tin bài hát gốc
   */
  async update(id, { title, description, artist, tempo, timeSignature, key, difficulty, tags, isActive }) {
    const payload = {};
    if (title !== undefined) payload.title = title;
    if (description !== undefined) payload.description = description;
    if (artist !== undefined) payload.artist = artist;
    if (tempo !== undefined) payload.tempo = tempo;
    if (timeSignature !== undefined) payload.timeSignature = timeSignature;
    if (key !== undefined) payload.key = key;
    if (difficulty !== undefined) payload.difficulty = difficulty;
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        payload.tags = tags.join(',');
      } else {
        payload.tags = tags;
      }
    }
    if (isActive !== undefined) payload.isActive = isActive;

    const response = await apiClient.patch(`/admin/reference-songs/${id}`, payload);
    return response?.data;
  },

  /**
   * Xóa bài hát gốc
   */
  async delete(id) {
    const response = await apiClient.delete(`/admin/reference-songs/${id}`);
    return response?.data;
  },
};

export default referenceSongService;


