import { apiClient } from './apiClient';

export const compareSongService = {
  /**
   * So sánh audio của user với bài hát gốc
   * @param {File} file - File audio của user
   * @param {string} referenceSongId - ID của bài hát gốc
   * @param {Object} options - Tùy chọn: hop, delta, match_window, sr
   * @returns {Promise<Object>} Kết quả so sánh
   */
  async compareAudio({ file, referenceSongId, ...options }) {
    if (!file) {
      throw new Error('File audio là bắt buộc.');
    }
    if (!referenceSongId) {
      throw new Error('ID bài hát gốc là bắt buộc.');
    }

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('referenceSongId', referenceSongId);

    // Thêm options nếu có
    if (options.hop) formData.append('hop', String(options.hop));
    if (options.delta) formData.append('delta', String(options.delta));
    if (options.match_window) formData.append('match_window', String(options.match_window));
    if (options.sr) formData.append('sr', String(options.sr));

    const response = await apiClient.post('/compare/audio', formData, {
      headers: {},
    });
    return response?.data;
  },

  /**
   * So sánh hai file audio trực tiếp
   * @param {File} file1 - File audio thứ nhất
   * @param {File} file2 - File audio thứ hai (optional nếu có referenceSongId)
   * @param {string} referenceSongId - ID của bài hát gốc (optional, thay cho file2)
   * @param {Object} options - Tùy chọn: hop, delta, match_window, sr
   * @returns {Promise<Object>} Kết quả so sánh
   */
  async compareTwoSongs({ file1, file2, referenceSongId, ...options }) {
    if (!file1) {
      throw new Error('File audio thứ nhất là bắt buộc.');
    }
    if (!file2 && !referenceSongId) {
      throw new Error('Cần có file audio thứ hai hoặc ID bài hát gốc.');
    }

    const formData = new FormData();
    formData.append('audio1', file1);
    if (file2) {
      formData.append('audio2', file2);
    }
    if (referenceSongId) {
      formData.append('referenceSongId', referenceSongId);
    }

    // Thêm options nếu có
    if (options.hop) formData.append('hop', String(options.hop));
    if (options.delta) formData.append('delta', String(options.delta));
    if (options.match_window) formData.append('match_window', String(options.match_window));
    if (options.sr) formData.append('sr', String(options.sr));

    const response = await apiClient.post('/compare/two-songs', formData, {
      headers: {},
    });
    return response?.data;
  },
};

export default compareSongService;

