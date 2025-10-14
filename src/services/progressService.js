import { apiClient } from './apiClient';

// Start a lesson
export const startLesson = async (courseId, lessonKey) => {
  try {
    const response = await apiClient.post('/progress/start', {
      courseId,
      lessonKey
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Có lỗi khi bắt đầu bài học');
  }
};

// Log practice session
export const logPractice = async (lessonKey, minutes, bpm, notes) => {
  try {
    const response = await apiClient.post('/progress/log-practice', {
      lessonKey,
      minutes,
      bpm,
      notes
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Có lỗi khi ghi log luyện tập');
  }
};

// Complete a lesson
export const completeLesson = async (lessonKey, score, acquiredSkills) => {
  try {
    const response = await apiClient.post('/progress/complete', {
      lessonKey,
      score,
      acquiredSkills
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Có lỗi khi hoàn thành bài học');
  }
};

// Get lesson progress
export const getLessonProgress = async (lessonKey) => {
  try {
    const response = await apiClient.get(`/progress/lesson/${lessonKey}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Có lỗi khi lấy tiến độ bài học');
  }
};

// Get course progress
export const getCourseProgress = async (courseId) => {
  try {
    const response = await apiClient.get(`/progress/course/${courseId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Có lỗi khi lấy tiến độ khóa học');
  }
};

// Get next recommended lesson
export const getNextLesson = async (courseSlug) => {
  try {
    const response = await apiClient.get(`/progress/next-lesson?course=${courseSlug}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Có lỗi khi lấy bài học tiếp theo');
  }
};
