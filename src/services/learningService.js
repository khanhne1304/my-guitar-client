import { apiClient } from './apiClient';

export function getPlacementTestApi() {
  return apiClient.get('/learning/placement-test');
}

export function postLearningOnboardingApi(payload) {
  return apiClient.post('/learning/onboarding', payload);
}

export function getLearningRoadmapApi() {
  return apiClient.get('/learning/roadmap');
}

export function postCompleteLessonApi(body) {
  return apiClient.post('/learning/complete-lesson', body);
}

export function postPracticeTimeApi(minutes) {
  return apiClient.post('/learning/practice-time', { minutes });
}

export function postVideoWatchTimeApi(minutes) {
  return apiClient.post('/learning/video-watch-time', { minutes });
}
