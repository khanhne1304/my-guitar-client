// src/components/Courses/CourseForm.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCourse, updateCourse, getCourseById } from '../../services/courseService';
import styles from './CourseForm.module.css';

/**
 * CourseForm Component
 * Form tạo mới hoặc chỉnh sửa khóa học
 */
export default function CourseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    level: 'beginner'
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const loadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCourseById(id);
      
      if (response.success) {
        const course = response.data;
        setFormData({
          title: course.title || '',
          description: course.description || '',
          thumbnail: course.thumbnail || '',
          level: course.level || 'beginner'
        });
      } else {
        setError(response.message || 'Không tìm thấy khóa học');
      }
    } catch (err) {
      console.error('Error loading course data:', err);
      setError(err.message || 'Có lỗi khi tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load course data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadCourseData();
    }
  }, [isEdit, id, loadCourseData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Tiêu đề khóa học là bắt buộc';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Tiêu đề phải có ít nhất 3 ký tự';
    } else if (formData.title.trim().length > 200) {
      errors.title = 'Tiêu đề không được vượt quá 200 ký tự';
    }

    // Description validation
    if (formData.description && formData.description.length > 2000) {
      errors.description = 'Mô tả không được vượt quá 2000 ký tự';
    }

    // Thumbnail validation
    if (formData.thumbnail) {
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      if (!urlPattern.test(formData.thumbnail)) {
        errors.thumbnail = 'URL ảnh phải là định dạng ảnh hợp lệ (jpg, jpeg, png, gif, webp)';
      }
    }

    // Level validation
    if (!['beginner', 'intermediate', 'advanced'].includes(formData.level)) {
      errors.level = 'Level không hợp lệ';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        thumbnail: formData.thumbnail.trim(),
        level: formData.level
      };

      let response;
      if (isEdit) {
        response = await updateCourse(id, courseData);
      } else {
        response = await createCourse(courseData);
      }

      if (response.success) {
        // Redirect to course detail page
        navigate(`/courses/${response.data._id}`);
      } else {
        setError(response.message || `Có lỗi khi ${isEdit ? 'cập nhật' : 'tạo'} khóa học`);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || `Có lỗi khi ${isEdit ? 'cập nhật' : 'tạo'} khóa học`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isEdit) {
      navigate(`/courses/${id}`);
    } else {
      navigate('/courses');
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.courseForm}>
      <div className={styles.courseForm__container}>
        {/* Header */}
        <div className={styles.courseForm__main}>
          <div className={styles.courseForm__header}>
            <h1 className={styles.courseForm__title}>
              {isEdit ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
            </h1>
            <p className={styles.courseForm__subtitle}>
              {isEdit ? 'Cập nhật thông tin khóa học' : 'Điền thông tin để tạo khóa học mới'}
            </p>
          </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

          {/* Form */}
          <div className={styles.courseForm__content}>
            <form onSubmit={handleSubmit}>
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề khóa học <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nhập tiêu đề khóa học..."
            maxLength={200}
          />
          {validationErrors.title && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.title.length}/200 ký tự
          </p>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả khóa học
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Mô tả chi tiết về khóa học..."
            maxLength={2000}
          />
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/2000 ký tự
          </p>
        </div>

        {/* Thumbnail Field */}
        <div>
          <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
            URL ảnh đại diện
          </label>
          <input
            type="url"
            id="thumbnail"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.thumbnail ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://example.com/image.jpg"
          />
          {validationErrors.thumbnail && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.thumbnail}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            URL ảnh phải có định dạng jpg, jpeg, png, gif hoặc webp
          </p>
        </div>

        {/* Level Field */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
            Mức độ khóa học <span className="text-red-500">*</span>
          </label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.level ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="beginner">Cơ bản</option>
            <option value="intermediate">Trung bình</option>
            <option value="advanced">Nâng cao</option>
          </select>
          {validationErrors.level && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.level}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Chọn mức độ phù hợp với nội dung khóa học
          </p>
        </div>

        {/* Preview Section */}
        {(formData.title || formData.thumbnail) && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xem trước</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  {formData.thumbnail ? (
                    <img
                      src={formData.thumbnail}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`${formData.thumbnail ? 'hidden' : 'flex'} w-16 h-16 bg-gray-200 rounded-lg items-center justify-center`}
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {formData.title || 'Tiêu đề khóa học'}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    {formData.description || 'Mô tả khóa học...'}
                  </p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      formData.level === 'beginner' ? 'bg-green-100 text-green-800' :
                      formData.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {formData.level === 'beginner' ? 'Cơ bản' :
                       formData.level === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {submitting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {submitting ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Tạo khóa học')}
          </button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
