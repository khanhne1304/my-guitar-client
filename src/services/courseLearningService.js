import { apiClient } from './apiClient';

export async function getCoursesApi() {
  const data = await apiClient.get('/courses');
  return data.courses || [];
}

export function getCourseSummaryApi(courseId) {
  return apiClient.get(`/courses/${courseId}`);
}

export function getModulesApi(courseId) {
  return apiClient.get(`/modules/${courseId}`);
}

export function getLessonsApi(moduleId) {
  return apiClient.get(`/lessons/${moduleId}`);
}

export function getModuleQuizApi(moduleId) {
  return apiClient.get(`/quiz/${moduleId}`);
}

export function postCourseCompleteLessonApi(lessonId) {
  return apiClient.post('/progress/complete-lesson', { lessonId });
}

export function postCourseQuizSubmitApi(moduleId, answers) {
  return apiClient.post('/quiz/submit', { moduleId, answers });
}
