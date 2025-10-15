// src/utils/debugAPI.js
// Debug script để kiểm tra API calls

import { apiClient } from '../services/apiClient';

/**
 * Debug API calls để tìm nguyên nhân không hiển thị dữ liệu
 */
export const debugCourseAPI = async () => {
  console.log('🔍 === DEBUGGING COURSE API ===');
  
  try {
    // Test 1: Kiểm tra base URL
    console.log('\n1. Checking base URL...');
    const baseURL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:4000/api';
    console.log('Base URL:', baseURL);
    
    // Test 2: Test direct API call
    console.log('\n2. Testing direct API call...');
    const response = await apiClient.get('/courses');
    console.log('✅ Direct API call success:', response);
    
    // Test 3: Kiểm tra cấu trúc response
    console.log('\n3. Checking response structure...');
    console.log('Response keys:', Object.keys(response));
    console.log('Success:', response.success);
    console.log('Message:', response.message);
    console.log('Data keys:', response.data ? Object.keys(response.data) : 'No data');
    console.log('Courses count:', response.data?.courses?.length || 0);
    
    // Test 4: Kiểm tra từng course
    if (response.data?.courses) {
      console.log('\n4. Checking individual courses...');
      response.data.courses.forEach((course, index) => {
        console.log(`Course ${index + 1}:`, {
          id: course._id,
          title: course.title,
          slug: course.slug,
          level: course.level,
          hasThumbnail: !!course.thumbnail,
          hasSummary: !!course.summary,
          hasDescription: !!course.description
        });
      });
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      data: error.data
    });
    throw error;
  }
};

/**
 * Test với các tham số khác nhau
 */
export const testCourseAPIWithParams = async () => {
  console.log('🔍 === TESTING COURSE API WITH PARAMS ===');
  
  const testCases = [
    { name: 'No params', params: {} },
    { name: 'With level filter', params: { level: 'beginner' } },
    { name: 'With search', params: { search: 'guitar' } },
    { name: 'With pagination', params: { page: 1, limit: 5 } }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`\nTesting: ${testCase.name}`);
      const response = await apiClient.get('/courses', { params: testCase.params });
      console.log(`✅ ${testCase.name} success:`, {
        success: response.success,
        coursesCount: response.data?.courses?.length || 0,
        total: response.data?.total || 0
      });
    } catch (error) {
      console.error(`❌ ${testCase.name} failed:`, error.message);
    }
  }
};

/**
 * Kiểm tra network requests
 */
export const checkNetworkRequests = () => {
  console.log('🔍 === CHECKING NETWORK REQUESTS ===');
  
  // Kiểm tra fetch API
  if (typeof fetch !== 'undefined') {
    console.log('✅ Fetch API available');
  } else {
    console.log('❌ Fetch API not available');
  }
  
  // Kiểm tra XMLHttpRequest
  if (typeof XMLHttpRequest !== 'undefined') {
    console.log('✅ XMLHttpRequest available');
  } else {
    console.log('❌ XMLHttpRequest not available');
  }
  
  // Kiểm tra environment variables
  console.log('Environment variables:');
  console.log('- VITE_API_BASE_URL:', import.meta?.env?.VITE_API_BASE_URL);
  console.log('- NODE_ENV:', import.meta?.env?.NODE_ENV);
  console.log('- MODE:', import.meta?.env?.MODE);
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.debugCourseAPI = debugCourseAPI;
  window.testCourseAPIWithParams = testCourseAPIWithParams;
  window.checkNetworkRequests = checkNetworkRequests;
  
  console.log('🔧 Debug functions available:');
  console.log('- debugCourseAPI()');
  console.log('- testCourseAPIWithParams()');
  console.log('- checkNetworkRequests()');
}
