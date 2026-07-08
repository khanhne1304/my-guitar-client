import { apiClient } from './apiClient';

export async function listAdminCourses() {
  const data = await apiClient.get('/admin/courses');
  return data.courses || [];
}

export function createAdminCourse(body) {
  return apiClient.post('/admin/courses', body);
}

export function updateAdminCourse(courseId, body) {
  return apiClient.put(`/admin/courses/${courseId}`, body);
}

export function deleteAdminCourse(courseId) {
  return apiClient.delete(`/admin/courses/${courseId}`);
}

export function publishAdminCourse(courseId) {
  return apiClient.patch(`/admin/courses/${courseId}/publish`, {});
}
