import { apiClient } from './apiClient';

function appendFormFields(formData, fields = {}) {
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, value);
  });
}

export const aiPracticeService = {
  // Phân tích audio chỉ để tính điểm, không upload
  async analyzeAudioClip({ file }) {
    if (!file) {
      throw new Error('File audio là bắt buộc.');
    }
    const formData = new FormData();
    formData.append('audio', file);

    const response = await apiClient.post('/ai/practice/analyze', formData, {
      headers: {},
    });
    return response?.data;
  },

  // Upload audio lên Cloudinary và lưu kết quả
  async uploadAudioClip({ file, ...fields }) {
    if (!file) {
      throw new Error('File audio là bắt buộc.');
    }
    const formData = new FormData();
    formData.append('audio', file);
    appendFormFields(formData, fields);

    const response = await apiClient.post('/ai/practice/upload', formData, {
      headers: {},
    });
    return response?.data;
  },

  async fetchHistory(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      search.set(key, value);
    });
    const query = search.toString() ? `?${search.toString()}` : '';
    const response = await apiClient.get(`/ai/practice/history${query}`);
    return response?.data;
  },

  async fetchAudioFiles(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      search.set(key, value);
    });
    const query = search.toString() ? `?${search.toString()}` : '';
    const response = await apiClient.get(`/ai/practice/audios${query}`);
    // apiClient trả về { success: true, data: { audios: [...], count: ... } }
    // Trả về response để component có thể truy cập cả success và data
    return response;
  },

  async deleteAudioFile(audioId) {
    if (!audioId) {
      throw new Error('Audio ID là bắt buộc.');
    }
    const response = await apiClient.delete(`/ai/practice/audios/${audioId}`);
    return response;
  },
};

export default aiPracticeService;

