import { apiClient } from './apiClient';

function appendFormFields(formData, fields = {}) {
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, value);
  });
}

export const aiPracticeService = {
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
};

export default aiPracticeService;

