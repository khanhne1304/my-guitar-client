// src/services/courseService.js
import { apiClient } from './apiClient';

/**
 * Course Service - Xử lý tất cả API calls liên quan đến khóa học
 */

// Base URL cho course endpoints
const COURSE_BASE_URL = '/courses';

/**
 * Lấy danh sách tất cả khóa học với filtering và pagination
 * @param {Object} params - Query parameters
 * @param {string} params.level - Level filter (beginner, intermediate, advanced)
 * @param {string} params.search - Search term
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.sortBy - Sort field
 * @param {string} params.sortOrder - Sort order (asc, desc)
 * @returns {Promise<Object>} Response data
 */
export const getAllCourses = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `${COURSE_BASE_URL}?${queryString}` : COURSE_BASE_URL;
    
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Alias for getAllCourses
export const getCourses = getAllCourses;

/**
 * Lấy chi tiết một khóa học theo ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Course data
 */
export const getCourseById = async (identifier) => {
  try {
    if (!identifier) {
      throw new Error('Course identifier is required');
    }
    
    const response = await apiClient.get(`${COURSE_BASE_URL}/${identifier}`);
    return response;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

/**
 * Tạo khóa học mới
 * @param {Object} courseData - Course data
 * @param {string} courseData.title - Course title
 * @param {string} courseData.description - Course description
 * @param {string} courseData.thumbnail - Thumbnail URL
 * @param {string} courseData.level - Course level
 * @param {Array} courseData.lessons - Array of lesson IDs
 * @returns {Promise<Object>} Created course data
 */
export const createCourse = async (courseData) => {
  try {
    const response = await apiClient.post(COURSE_BASE_URL, courseData);
    return response;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

/**
 * Cập nhật khóa học
 * @param {string} courseId - Course ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated course data
 */
export const updateCourse = async (courseId, updateData) => {
  try {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    
    const response = await apiClient.put(`${COURSE_BASE_URL}/${courseId}`, updateData);
    return response;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

/**
 * Xóa khóa học
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteCourse = async (courseId) => {
  try {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    
    const response = await apiClient.delete(`${COURSE_BASE_URL}/${courseId}`);
    return response;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

/**
 * Lấy khóa học theo level
 * @param {string} level - Course level
 * @returns {Promise<Array>} Courses array
 */
export const getCoursesByLevel = async (level) => {
  try {
    if (!level) {
      throw new Error('Level is required');
    }
    
    const response = await apiClient.get(`${COURSE_BASE_URL}/level/${level}`);
    return response;
  } catch (error) {
    console.error('Error fetching courses by level:', error);
    throw error;
  }
};

/**
 * Tìm kiếm khóa học theo tiêu đề
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Courses array
 */
export const searchCourses = async (searchTerm) => {
  try {
    if (!searchTerm) {
      throw new Error('Search term is required');
    }
    
    const response = await apiClient.get(`${COURSE_BASE_URL}/search/${encodeURIComponent(searchTerm)}`);
    return response;
  } catch (error) {
    console.error('Error searching courses:', error);
    throw error;
  }
};

/**
 * Lấy khóa học của user hiện tại
 * @returns {Promise<Array>} User's courses
 */
export const getMyCourses = async () => {
  try {
    const response = await apiClient.get(`${COURSE_BASE_URL}/my-courses`);
    return response;
  } catch (error) {
    console.error('Error fetching my courses:', error);
    throw error;
  }
};

/**
 * Thêm bài học vào khóa học
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Updated course data
 */
export const addLessonToCourse = async (courseId, lessonId) => {
  try {
    if (!courseId || !lessonId) {
      throw new Error('Course ID and Lesson ID are required');
    }
    
    const response = await apiClient.post(`${COURSE_BASE_URL}/${courseId}/lessons`, {
      lessonId
    });
    return response;
  } catch (error) {
    console.error('Error adding lesson to course:', error);
    throw error;
  }
};

/**
 * Xóa bài học khỏi khóa học
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Updated course data
 */
export const removeLessonFromCourse = async (courseId, lessonId) => {
  try {
    if (!courseId || !lessonId) {
      throw new Error('Course ID and Lesson ID are required');
    }
    
    const response = await apiClient.delete(`${COURSE_BASE_URL}/${courseId}/lessons/${lessonId}`);
    return response;
  } catch (error) {
    console.error('Error removing lesson from course:', error);
    throw error;
  }
};

/**
 * Lấy khóa học tương tác
 * @returns {Promise<Array>} Interactive courses
 */
export const getInteractiveCourses = async () => {
  try {
    const response = await apiClient.get(`${COURSE_BASE_URL}/interactive`);
    return response;
  } catch (error) {
    console.error('Error fetching interactive courses:', error);
    throw error;
  }
};
/**
 * Lấy khóa học theo tính năng tương tác
 * @param {Object} features - Interactive features
 * @returns {Promise<Array>} Courses with specified features
 */
export const getCoursesByInteractiveFeatures = async (features) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(features).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    const response = await apiClient.get(`${COURSE_BASE_URL}/interactive/features?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching courses by interactive features:', error);
    throw error;
  }
};

/**
 * Cập nhật tiến độ học tập
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {Object} progressData - Progress data
 * @returns {Promise<Object>} Updated progress
 */
export const updateLearningProgress = async (courseId, lessonId, progressData) => {
  try {
    if (!courseId || !lessonId) {
      throw new Error('Course ID and Lesson ID are required');
    }
    
    const response = await apiClient.post(`${COURSE_BASE_URL}/${courseId}/lessons/${lessonId}/progress`, progressData);
    return response;
  } catch (error) {
    console.error('Error updating learning progress:', error);
    throw error;
  }
};

/**
 * Lấy tiến độ học tập của người dùng
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} User progress data
 */
export const getUserProgress = async (courseId) => {
  try {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    
    const response = await apiClient.get(`${COURSE_BASE_URL}/${courseId}/progress`);
    return response;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

/**
 * Đánh giá khóa học
 * @param {string} courseId - Course ID
 * @param {Object} ratingData - Rating data
 * @returns {Promise<Object>} Rating response
 */
export const rateCourse = async (courseId, ratingData) => {
  try {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    
    const response = await apiClient.post(`${COURSE_BASE_URL}/${courseId}/rate`, ratingData);
    return response;
  } catch (error) {
    console.error('Error rating course:', error);
    throw error;
  }
};

/**
 * Lấy thống kê khóa học
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Course statistics
 */
export const getCourseStats = async (courseId) => {
  try {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    
    const response = await apiClient.get(`${COURSE_BASE_URL}/${courseId}/stats`);
    return response;
  } catch (error) {
    console.error('Error fetching course stats:', error);
    throw error;
  }
};

/**
 * Bắt đầu phiên luyện tập
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {Object} sessionData - Session data
 * @returns {Promise<Object>} Session response
 */
export const startPracticeSession = async (courseId, lessonId, sessionData) => {
  try {
    if (!courseId || !lessonId) {
      throw new Error('Course ID and Lesson ID are required');
    }
    
    const response = await apiClient.post(`${COURSE_BASE_URL}/${courseId}/lessons/${lessonId}/session/start`, sessionData);
    return response;
  } catch (error) {
    console.error('Error starting practice session:', error);
    throw error;
  }
};

/**
 * Kết thúc phiên luyện tập
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {string} sessionId - Session ID
 * @param {Object} sessionData - Session data
 * @returns {Promise<Object>} Session response
 */
export const endPracticeSession = async (courseId, lessonId, sessionId, sessionData) => {
  try {
    if (!courseId || !lessonId || !sessionId) {
      throw new Error('Course ID, Lesson ID and Session ID are required');
    }
    
    const response = await apiClient.post(`${COURSE_BASE_URL}/${courseId}/lessons/${lessonId}/session/${sessionId}/end`, sessionData);
    return response;
  } catch (error) {
    console.error('Error ending practice session:', error);
    throw error;
  }
};

// Export default object với tất cả functions
const courseService = {
  getAllCourses,
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByLevel,
  searchCourses,
  getMyCourses,
  addLessonToCourse,
  removeLessonFromCourse,
  getInteractiveCourses,
  getCoursesByInteractiveFeatures,
  updateLearningProgress,
  getUserProgress,
  rateCourse,
  getCourseStats,
  startPracticeSession,
  endPracticeSession
};

export default courseService;

