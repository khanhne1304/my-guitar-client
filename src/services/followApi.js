import { apiClient } from './apiClient';

export const followApi = {
  followUser: (userId) => apiClient.post(`/follow/user/${encodeURIComponent(userId)}`, {}),
  unfollowUser: (userId) => apiClient.delete(`/follow/user/${encodeURIComponent(userId)}`),
  followTag: (tag) => apiClient.post(`/follow/tag/${encodeURIComponent(tag)}`, {}),
  unfollowTag: (tag) => apiClient.delete(`/follow/tag/${encodeURIComponent(tag)}`),
  listMe: () => apiClient.get('/follow/me'),
};
