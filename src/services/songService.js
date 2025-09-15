import { apiClient } from "./apiClient";

export const songService = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/songs${query ? `?${query}` : ""}`);
  },

  async getBySlug(slug) {
    return apiClient.get(`/songs/${slug}`);
  },

  async create(data) {
    return apiClient.post("/songs", data);
  },

  async update(id, data) {
    return apiClient.patch(`/songs/${id}`, data);
  },

  async remove(id) {
    return apiClient.delete(`/songs/${id}`);
  },
};
