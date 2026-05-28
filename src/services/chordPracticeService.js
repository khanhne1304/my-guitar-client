import { apiClient } from './apiClient';

export const chordPracticeService = {
  /**
   * Phân tích hợp âm từ audio và so sánh với bài HopAmChuan.
   * @param {{ file: File, hopamUrl: string, segmentSec?: number, referenceBpm?: number, referenceTranspose?: number }} params
   */
  async analyzeAndCompare({ file, hopamUrl, segmentSec, referenceBpm, referenceTranspose }) {
    if (!file) throw new Error('File audio là bắt buộc.');
    if (!hopamUrl) throw new Error('Chọn bài từ Hợp âm chuẩn để so sánh.');

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('hopamUrl', hopamUrl);
    if (segmentSec) formData.append('segmentSec', String(segmentSec));
    if (referenceBpm != null && referenceBpm !== '') {
      formData.append('referenceBpm', String(referenceBpm));
    }
    if (referenceTranspose != null && referenceTranspose !== '') {
      formData.append('referenceTranspose', String(referenceTranspose));
    }

    const response = await apiClient.post('/chord-practice/analyze', formData, {
      headers: {},
    });
    return response?.data;
  },

  /**
   * Gợi ý luyện tập chuyên sâu (Google Gemini) từ kết quả phân tích.
   * @param {object} analysisPayload — object `data` trả về từ analyzeAndCompare
   */
  async getPracticeAdvice(analysisPayload) {
    const response = await apiClient.post('/chord-practice/advice', {
      data: analysisPayload,
    });
    return response?.data;
  },

  /** Chỉ nhận diện hợp âm (không so sánh). */
  async analyzeOnly({ file, segmentSec }) {
    if (!file) throw new Error('File audio là bắt buộc.');

    const formData = new FormData();
    formData.append('audio', file);
    if (segmentSec) formData.append('segmentSec', String(segmentSec));

    const response = await apiClient.post('/chord-practice/analyze-only', formData, {
      headers: {},
    });
    return response?.data;
  },
};

export default chordPracticeService;
