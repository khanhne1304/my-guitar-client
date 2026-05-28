import { apiClient } from "./apiClient";

export async function getUnreadMessagesCountApi() {
  const data = await apiClient.get("/messages/unread-count");
  return data?.unreadCount ?? 0;
}

export async function getConversationsApi() {
  return apiClient.get("/messages/conversations");
}

export async function getThreadMessagesApi(userId, { before, limit } = {}) {
  const qs = new URLSearchParams();
  if (before) qs.set("before", before);
  if (limit != null) qs.set("limit", String(limit));
  const q = qs.toString();
  return apiClient.get(
    `/messages/with/${encodeURIComponent(userId)}${q ? `?${q}` : ""}`
  );
}

export async function sendDirectMessageApi(userId, text) {
  return apiClient.post(`/messages/with/${encodeURIComponent(userId)}`, { text });
}
