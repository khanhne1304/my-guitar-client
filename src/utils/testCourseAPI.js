// src/utils/testCourseAPI.js
// Utility để test Course API từ frontend

import * as courseService from '../services/courseService';

/**
 * Test Course API functions
 * Có thể gọi từ browser console để test
 */
export const testCourseAPI = async () => {
  console.log('🧪 === TESTING COURSE API ===');
  
  try {
    // Test 1: Get all courses
    console.log('\n1. Testing getAllCourses...');
    const allCourses = await courseService.getAllCourses();
    console.log('✅ getAllCourses success:', allCourses);
    
    // Test 2: Get courses with filters
    console.log('\n2. Testing getAllCourses with filters...');
    const filteredCourses = await courseService.getAllCourses({
      level: 'beginner',
      page: 1,
      limit: 5
    });
    console.log('✅ getAllCourses with filters success:', filteredCourses);
    
    // Test 3: Search courses
    console.log('\n3. Testing searchCourses...');
    const searchResults = await courseService.searchCourses('guitar');
    console.log('✅ searchCourses success:', searchResults);
    
    // Test 4: Get courses by level
    console.log('\n4. Testing getCoursesByLevel...');
    const levelCourses = await courseService.getCoursesByLevel('beginner');
    console.log('✅ getCoursesByLevel success:', levelCourses);
    
    // Test 5: Get my courses (if authenticated)
    console.log('\n5. Testing getMyCourses...');
    try {
      const myCourses = await courseService.getMyCourses();
      console.log('✅ getMyCourses success:', myCourses);
    } catch (error) {
      console.log('⚠️ getMyCourses failed (expected if not authenticated):', error.message);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

/**
 * Test creating a course (requires authentication)
 */
export const testCreateCourse = async () => {
  console.log('🧪 === TESTING CREATE COURSE ===');
  
  const courseData = {
    title: 'Test Course - ' + new Date().toISOString(),
    description: 'This is a test course created from frontend',
    level: 'beginner'
  };
  
  try {
    const result = await courseService.createCourse(courseData);
    console.log('✅ Create course success:', result);
    return result;
  } catch (error) {
    console.error('❌ Create course failed:', error);
    throw error;
  }
};

/**
 * Test updating a course (requires authentication and course ID)
 */
export const testUpdateCourse = async (courseId) => {
  console.log('🧪 === TESTING UPDATE COURSE ===');
  
  if (!courseId) {
    console.error('❌ Course ID is required for update test');
    return;
  }
  
  const updateData = {
    title: 'Updated Test Course - ' + new Date().toISOString(),
    description: 'This course has been updated from frontend'
  };
  
  try {
    const result = await courseService.updateCourse(courseId, updateData);
    console.log('✅ Update course success:', result);
    return result;
  } catch (error) {
    console.error('❌ Update course failed:', error);
    throw error;
  }
};

/**
 * Test getting course by ID
 */
export const testGetCourseById = async (courseId) => {
  console.log('🧪 === TESTING GET COURSE BY ID ===');
  
  if (!courseId) {
    console.error('❌ Course ID is required');
    return;
  }
  
  try {
    const result = await courseService.getCourseById(courseId);
    console.log('✅ Get course by ID success:', result);
    return result;
  } catch (error) {
    console.error('❌ Get course by ID failed:', error);
    throw error;
  }
};

/**
 * Test deleting a course (requires authentication and course ID)
 */
export const testDeleteCourse = async (courseId) => {
  console.log('🧪 === TESTING DELETE COURSE ===');
  
  if (!courseId) {
    console.error('❌ Course ID is required for delete test');
    return;
  }
  
  try {
    const result = await courseService.deleteCourse(courseId);
    console.log('✅ Delete course success:', result);
    return result;
  } catch (error) {
    console.error('❌ Delete course failed:', error);
    throw error;
  }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🚀 === RUNNING ALL COURSE API TESTS ===');
  
  try {
    // Run basic tests
    await testCourseAPI();
    
    // Test create course
    const createdCourse = await testCreateCourse();
    
    if (createdCourse?.data?._id) {
      const courseId = createdCourse.data._id;
      
      // Test get by ID
      await testGetCourseById(courseId);
      
      // Test update
      await testUpdateCourse(courseId);
      
      // Test delete
      await testDeleteCourse(courseId);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Some tests failed:', error);
  }
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.testCourseAPI = testCourseAPI;
  window.testCreateCourse = testCreateCourse;
  window.testUpdateCourse = testUpdateCourse;
  window.testGetCourseById = testGetCourseById;
  window.testDeleteCourse = testDeleteCourse;
  window.runAllCourseTests = runAllTests;
  
  console.log('🔧 Course API test functions available:');
  console.log('- testCourseAPI()');
  console.log('- testCreateCourse()');
  console.log('- testUpdateCourse(courseId)');
  console.log('- testGetCourseById(courseId)');
  console.log('- testDeleteCourse(courseId)');
  console.log('- runAllCourseTests()');
}
