// src/components/Courses/CourseDetail.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById } from '../../services/courseService';
import { getCourseProgress } from '../../services/progressService';
import styles from './CourseDetail.module.css';

/**
 * CourseDetail Component
 * Hiển thị chi tiết khóa học và danh sách bài học với tiến độ
 */
export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch course details and progress
  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course details
      const courseResponse = await getCourseById(slug);
      
      if (courseResponse.success) {
        setCourse(courseResponse.data);
        
        // Fetch user progress for this course
        try {
          const progressResponse = await getCourseProgress(courseResponse.data._id);
          if (progressResponse.success) {
            setProgress(progressResponse.data);
          }
        } catch (progressErr) {
          console.warn('Could not fetch progress:', progressErr);
          // Progress is optional, don't fail the whole component
        }
      } else {
        setError(courseResponse.message || 'Không tìm thấy khóa học');
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError(err.message || 'Có lỗi khi tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchCourseDetails();
    }
  }, [slug, fetchCourseDetails]);

  // Get level display info
  const getLevelInfo = (level) => {
    switch (level) {
      case 'beginner':
        return { text: 'Cơ bản', color: 'bg-green-100 text-green-800', icon: '🌱' };
      case 'intermediate':
        return { text: 'Trung bình', color: 'bg-yellow-100 text-yellow-800', icon: '🌿' };
      case 'advanced':
        return { text: 'Nâng cao', color: 'bg-red-100 text-red-800', icon: '🌳' };
      default:
        return { text: 'Cơ bản', color: 'bg-gray-100 text-gray-800', icon: '🌱' };
    }
  };

  // Format date
  // Format date helper (currently unused but kept for future use)
  // const formatDate = (dateString) => {
  //   if (!dateString) return '';
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('vi-VN', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });
  // };

  // Mock modules and lessons data (since we don't have the new structure yet)
  const mockModules = [
    {
      _id: '1',
      title: 'Module 1: Cơ bản',
      description: 'Những kiến thức cơ bản để bắt đầu',
      order: 1,
      lessons: [
        {
          _id: '1-1',
          title: 'Giới thiệu về khóa học',
          description: 'Tìm hiểu tổng quan về khóa học và những gì bạn sẽ học được',
          duration: 15,
          order: 1,
          contentType: 'note',
          isCompleted: false
        },
        {
          _id: '1-2',
          title: 'Cài đặt môi trường học tập',
          description: 'Hướng dẫn cài đặt các công cụ cần thiết cho việc học',
          duration: 25,
          order: 2,
          contentType: 'note',
          isCompleted: false
        }
      ]
    },
    {
      _id: '2',
      title: 'Module 2: Thực hành',
      description: 'Các bài thực hành cơ bản',
      order: 2,
      lessons: [
        {
          _id: '2-1',
          title: 'Bài học thực hành đầu tiên',
          description: 'Bắt đầu với bài thực hành cơ bản nhất',
          duration: 45,
          order: 1,
          contentType: 'chord',
          isCompleted: false
        },
        {
          _id: '2-2',
          title: 'Kiến thức nâng cao',
          description: 'Tìm hiểu các khái niệm phức tạp hơn',
          duration: 60,
          order: 2,
          contentType: 'rhythm',
          isCompleted: false
        }
      ]
    }
  ];

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
          <div className="space-x-4">
            <button
              onClick={fetchCourseDetails}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Thử lại
            </button>
            <Link
              to="/courses"
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h2>
          <Link
            to="/courses"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(course.level);
  const modules = course.modules && course.modules.length > 0 ? course.modules : mockModules;
  
  // Calculate total lesson count across all modules
  const totalLessons = modules.reduce((total, module) => {
    return total + (module.lessons ? module.lessons.length : 0);
  }, 0);

  return (
    <div className={styles.courseDetail}>
      <div className={styles.courseDetail__container}>
        {/* Breadcrumb */}
        <nav className={styles.courseDetail__breadcrumb} aria-label="Breadcrumb">
          <ol className={styles.courseDetail__breadcrumbList}>
            <li className={styles.courseDetail__breadcrumbItem}>
              <Link to="/" className={styles.courseDetail__breadcrumbLink}>
                Trang chủ
              </Link>
              <span className={styles.courseDetail__breadcrumbSeparator}>/</span>
            </li>
            <li className={styles.courseDetail__breadcrumbItem}>
              <Link to="/courses" className={styles.courseDetail__breadcrumbLink}>
                Khóa học
              </Link>
              <span className={styles.courseDetail__breadcrumbSeparator}>/</span>
            </li>
            <li className={styles.courseDetail__breadcrumbItem}>
              <span className={styles.courseDetail__breadcrumbCurrent}>{course.title}</span>
            </li>
          </ol>
        </nav>

        {/* Course Header */}
        <div className={styles.courseDetail__main}>
          {/* Thumbnail */}
          <div className={styles.courseDetail__header}>
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className={styles.courseDetail__thumbnail}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`${styles.courseDetail__thumbnailPlaceholder} ${course.thumbnail ? styles.hidden : ''}`}
            >
              <div className="text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">Khóa học</p>
              </div>
            </div>

            {/* Course Info */}
            <div className={styles.courseDetail__content}>
              <h1 className={styles.courseDetail__title}>{course.title}</h1>
              
              <div className={styles.courseDetail__meta}>
                <div className={styles.courseDetail__metaItem}>
                  <span className={`${styles.courseDetail__level} ${styles[`level${course.level.charAt(0).toUpperCase() + course.level.slice(1)}`]}`}>
                    {levelInfo.text}
                  </span>
                </div>
                <div className={styles.courseDetail__metaItem}>
                  <svg className={styles.courseDetail__metaIcon} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span>{course.lessonCount || totalLessons} bài học</span>
                </div>
              </div>

              {/* Description */}
              <div className={styles.courseDetail__section}>
                <p className={styles.courseDetail__description}>
                  {course.description || 'Khóa học này sẽ giúp bạn nắm vững những kiến thức cơ bản và phát triển kỹ năng một cách hiệu quả.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className={styles.courseDetail__actions}>
                <button className={`${styles.courseDetail__actionButton} ${styles.courseDetail__actionButtonPrimary}`}>
                  Bắt đầu học
                </button>
                <button className={`${styles.courseDetail__actionButton} ${styles.courseDetail__actionButtonSecondary}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modules and Lessons Section */}
        <div className={styles.courseDetail__main}>
          <div className={styles.courseDetail__content}>
            <div className={styles.courseDetail__section}>
              <h2 className={styles.courseDetail__sectionTitle}>Nội dung khóa học</h2>
              
              {modules.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">Chưa có module nào trong khóa học này</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {modules.map((module, moduleIndex) => (
                    <div key={module._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {module.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {module.lessons ? module.lessons.length : 0} bài học
                        </span>
                      </div>
                      
                      {module.description && (
                        <p className="text-gray-600 mb-4">{module.description}</p>
                      )}
                      
                      {module.lessons && module.lessons.length > 0 ? (
                        <ul className="space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <li key={lesson._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                {lesson.order || lessonIndex + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <Link 
                                    to={`/learning/${course.slug}/lessons/${module.order}.${lesson.order}`}
                                    className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                  >
                                    {lesson.title}
                                  </Link>
                                  <div className="flex items-center space-x-2">
                                    {lesson.type && (
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        lesson.type === 'THEORY' ? 'bg-green-100 text-green-800' :
                                        lesson.type === 'CHORD' ? 'bg-blue-100 text-blue-800' :
                                        lesson.type === 'STRUM' ? 'bg-purple-100 text-purple-800' :
                                        lesson.type === 'SONG' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {lesson.type === 'THEORY' ? '📚 Lý thuyết' :
                                         lesson.type === 'CHORD' ? '🎵 Hợp âm' :
                                         lesson.type === 'STRUM' ? '🥁 Tiết tấu' :
                                         lesson.type === 'SONG' ? '🎤 Bài hát' :
                                         '💪 Luyện tập'}
                                      </span>
                                    )}
                                    {lesson.durationMin && (
                                      <span className="text-xs text-gray-500">
                                        {lesson.durationMin} phút
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {lesson.objectives && lesson.objectives.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">Mục tiêu:</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                      {lesson.objectives.slice(0, 2).map((objective, idx) => (
                                        <li key={idx} className="flex items-start">
                                          <span className="mr-1">•</span>
                                          <span>{objective}</span>
                                        </li>
                                      ))}
                                      {lesson.objectives.length > 2 && (
                                        <li className="text-gray-400">
                                          +{lesson.objectives.length - 2} mục tiêu khác
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">Chưa có bài học nào trong module này</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
