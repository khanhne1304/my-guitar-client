// src/services/userService.js
import { apiClient } from "./apiClient";

export async function getUserProfileApi() {
  return apiClient.get("/users/profile");
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