import { apiClient } from './apiClient';

export async function getDashboardApi() {
  return apiClient.get('/dashboard');
}

export async function getCoursesApi() {
  const data = await apiClient.get('/courses');
  return data.courses || [];
}

export async function getMyCoursesApi() {
  const data = await apiClient.get('/courses?mine=1');
  return data.courses || [];
}

export function getCourseApi(courseId) {
  return apiClient.get(`/courses/${courseId}`);
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

export function publishCourseApi(courseId) {
  return apiClient.patch(`/courses/${courseId}/publish`, {});
}

export function createModuleApi(body) {
  return apiClient.post('/modules', body);
}

export function updateModuleApi(moduleId, body) {
  return apiClient.put(`/modules/${moduleId}`, body);
}

export function deleteModuleApi(moduleId) {
  return apiClient.delete(`/modules/${moduleId}`);
}

export function createLessonApi(body) {
  return apiClient.post('/lessons', body);
}

export function updateLessonApi(lessonId, body) {
  return apiClient.put(`/lessons/${lessonId}`, body);
}

export function deleteLessonApi(lessonId) {
  return apiClient.delete(`/lessons/${lessonId}`);
}

export function createQuizApi(body) {
  return apiClient.post('/quizzes', body);
}

export function getQuizApi(quizId) {
  return apiClient.get(`/quizzes/${quizId}`);
}

export function updateQuizApi(quizId, body) {
  return apiClient.put(`/quizzes/${quizId}`, body);
}

export function deleteQuizApi(quizId) {
  return apiClient.delete(`/quizzes/${quizId}`);
}

export function submitQuizApi(quizId, answers) {
  return apiClient.post(`/quizzes/${quizId}/submit`, { answers });
}

export function upsertPracticeRoutineApi(body) {
  return apiClient.put('/practice-routines', body);
}

export function deletePracticeRoutineApi(moduleId) {
  return apiClient.delete(`/practice-routines/${moduleId}`);
}

export function upsertChallengeSongApi(body) {
  return apiClient.put('/challenge-songs', body);
}

export function deleteChallengeSongApi(moduleId) {
  return apiClient.delete(`/challenge-songs/${moduleId}`);
}

export function completeLessonApi(lessonId) {
  return apiClient.post('/progress/complete-lesson', { lessonId });
}

export function logPracticeApi(moduleId, minutes = 0) {
  return apiClient.post('/progress/log-practice', { moduleId, minutes });
}

export function getProgressApi(courseId) {
  return apiClient.get(`/progress/${courseId}`);
}
