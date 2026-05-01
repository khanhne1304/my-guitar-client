// src/services/userService.js
import { apiClient } from "./apiClient";

export async function getUserProfileApi() {
  return apiClient.get("/users/profile");
}

export async function getPublicUserProfileApi(userId) {
  return apiClient.get(`/users/public/${encodeURIComponent(userId)}`);
}

export async function updateUserProfileApi(payload) {
  return apiClient.put("/users/profile", payload);
}
export async function changePasswordApi({ currentPassword, newPassword }) {
  return apiClient.put("/users/profile/password", {
    currentPassword,
    newPassword,
  });
}
export async function uploadAvatarApi(file) {
  const fd = new FormData();
  fd.append("avatar", file);
  return apiClient.put("/users/profile/avatar", fd);
}

// --- Friends / search ---
export async function searchUsersApi({ q, limit = 20 }) {
  const qs = new URLSearchParams();
  if (q != null) qs.set("q", q);
  if (limit != null) qs.set("limit", String(limit));
  return apiClient.get(`/users/search?${qs.toString()}`);
}

export async function getFriendsApi() {
  return apiClient.get("/users/friends");
}

export async function getFriendRequestsApi() {
  return apiClient.get("/users/friend-requests");
}

export async function sendFriendRequestApi(userId) {
  return apiClient.post(`/users/friend-requests/${encodeURIComponent(userId)}`, {});
}

export async function acceptFriendRequestApi(userId) {
  return apiClient.post(
    `/users/friend-requests/${encodeURIComponent(userId)}/accept`,
    {}
  );
}

export async function cancelOrDeclineFriendRequestApi(userId) {
  return apiClient.delete(`/users/friend-requests/${encodeURIComponent(userId)}`);
}

export async function unfriendApi(userId) {
  return apiClient.delete(`/users/friends/${encodeURIComponent(userId)}`);
}

export async function blockUserApi(userId) {
  return apiClient.post(`/users/blocks/${encodeURIComponent(userId)}`, {});
}

export async function unblockUserApi(userId) {
  return apiClient.delete(`/users/blocks/${encodeURIComponent(userId)}`);
}