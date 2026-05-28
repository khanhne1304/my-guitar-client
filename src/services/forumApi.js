import { apiClient } from './apiClient';

function toQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s) return;
    qs.set(k, s);
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export const forumApi = {
  listThreads: async ({ category, type, q, tags, sort, userId } = {}) => {
    const params = {
      category,
      type,
      q,
      sort,
      userId,
      tags: Array.isArray(tags) ? tags.join(',') : tags,
    };
    return await apiClient.get(`/forum/threads${toQuery(params)}`);
  },

  getThread: async (threadId) => {
    return await apiClient.get(`/forum/threads/${encodeURIComponent(threadId)}`);
  },

  createThread: async ({ title, content, type, category, tags, mediaUrl, files, videoUrl }) => {
    return await apiClient.post('/forum/threads', { title, content, type, category, tags, mediaUrl, files, videoUrl });
  },

  uploadFile: async (file) => {
    const form = new FormData();
    form.append('file', file);
    return await apiClient.post('/forum/uploads', form);
  },

  deleteThread: async (threadId) => {
    return await apiClient.delete(`/forum/threads/${encodeURIComponent(threadId)}`);
  },

  listAnswers: async (threadId) => {
    return await apiClient.get(`/forum/threads/${encodeURIComponent(threadId)}/answers`);
  },

  createAnswer: async ({ threadId, content }) => {
    return await apiClient.post('/forum/answers', { threadId, content });
  },

  updateAnswer: async ({ answerId, content }) => {
    return await apiClient.patch(`/forum/answers/${encodeURIComponent(answerId)}`, { content });
  },

  deleteAnswer: async (answerId) => {
    return await apiClient.delete(`/forum/answers/${encodeURIComponent(answerId)}`);
  },

  toggleAnswerLike: async (answerId) => {
    return await apiClient.post(`/forum/answers/${encodeURIComponent(answerId)}/likes`, {});
  },

  markBestAnswer: async (answerId) => {
    return await apiClient.patch(`/forum/answers/${encodeURIComponent(answerId)}/best`, {});
  },

  listReplies: async (answerId) => {
    return await apiClient.get(`/forum/answers/${encodeURIComponent(answerId)}/replies`);
  },

  createReply: async ({ answerId, content }) => {
    return await apiClient.post('/forum/replies', { answerId, content });
  },

  updateReply: async ({ replyId, content }) => {
    return await apiClient.patch(`/forum/replies/${encodeURIComponent(replyId)}`, { content });
  },

  deleteReply: async (replyId) => {
    return await apiClient.delete(`/forum/replies/${encodeURIComponent(replyId)}`);
  },

  toggleLike: async (threadId) => {
    return await apiClient.post('/forum/likes', { threadId });
  },

  reportThread: async ({ threadId, reason }) => {
    return await apiClient.post('/forum/reports', { threadId, reason });
  },

  listReports: async () => {
    return await apiClient.get('/forum/reports');
  },
};

