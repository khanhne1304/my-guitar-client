import { apiClient } from './apiClient';

export async function getMyCoursesApi() {
  const data = await apiClient.get('/instructor/my-courses');
  return data.courses || [];
}

export function createCourseApi(body) {
  return apiClient.post('/courses', body);
}

export function updateCourseApi(courseId, body) {
  return apiClient.put(`/courses/${courseId}`, body);
}

export function deleteCourseApi(courseId) {
  return apiClient.delete(`/courses/${courseId}`);
}

export function getCourseBuilderApi(courseId) {
  return apiClient.get(`/instructor/courses/${courseId}/builder`);
}

export function addModuleApi(body) {
  return apiClient.post('/modules', body);
}

export function addLessonApi(body) {
  return apiClient.post('/lessons', body);
}

export function upsertQuizApi(body) {
  return apiClient.post('/quiz', body);
}

export function publishCourseApi(courseId) {
  return apiClient.patch(`/courses/${courseId}/publish`, {});
}

export function reorderModulesApi(courseId, orderedModuleIds) {
  return apiClient.patch(`/instructor/courses/${courseId}/modules/reorder`, { orderedModuleIds });
}
