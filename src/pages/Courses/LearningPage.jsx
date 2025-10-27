import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../../services/courseService';
import styles from './LearningPage.module.css';

/**
 * LearningPage Component
 * Trang danh sách khóa học cho học tập
 */
export default function LearningPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getAllCourses({
          search: searchTerm,
          level: selectedLevel !== 'all' ? selectedLevel : undefined,
          page: 1,
          limit: 12
        });
        
        if (response.success) {
          setCourses(response.data.courses);
        } else {
          setError(response.message || 'Không thể tải danh sách khóa học');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Có lỗi khi tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchTerm, selectedLevel]);

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

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.learningPage}>
      <div className={styles.learningPage__container}>
        {/* Header */}
        <div className={styles.learningPage__header}>
          <h1 className={styles.learningPage__title}>
            🎸 Học Guitar Tương Tác
          </h1>
          <p className={styles.learningPage__subtitle}>
            Khám phá các khóa học guitar với giao diện học tương tác, metronome và feedback thời gian thực
          </p>
        </div>

        {/* Search and Filter */}
        <div className={styles.learningPage__filters}>
          <div className={styles.learningPage__search}>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.learningPage__searchInput}
              />
              <svg className={styles.learningPage__searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className={styles.learningPage__levelFilter}>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className={styles.learningPage__levelSelect}
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung bình</option>
              <option value="advanced">Nâng cao</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        <div className={styles.learningPage__content}>
          {loading ? (
            <LoadingSkeleton />
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy khóa học</h3>
              <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
          ) : (
            <div className={styles.learningPage__grid}>
              {courses.map((course) => {
                const levelInfo = getLevelInfo(course.level);
                const totalLessons = course.modules ? 
                  course.modules.reduce((total, module) => total + (module.lessons ? module.lessons.length : 0), 0) : 0;

                return (
                  <div key={course._id} className={styles.learningPage__card}>
                    {/* Thumbnail */}
                    <div className={styles.learningPage__cardThumbnail}>
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className={styles.learningPage__cardImage}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`${styles.learningPage__cardPlaceholder} ${course.thumbnail ? styles.hidden : ''}`}
                      >
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      
                      {/* Level Badge */}
                      <div className={styles.learningPage__cardBadge}>
                        <span className={`${styles.learningPage__cardLevel} ${styles[`level${course.level.charAt(0).toUpperCase() + course.level.slice(1)}`]}`}>
                          {levelInfo.icon} {levelInfo.text}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={styles.learningPage__cardContent}>
                      <h3 className={styles.learningPage__cardTitle}>
                        {course.title}
                      </h3>
                      
                      <p className={styles.learningPage__cardDescription}>
                        {course.description ? 
                          (course.description.length > 100 ? 
                            course.description.substring(0, 100) + '...' : 
                            course.description
                          ) : 
                          'Khóa học guitar chất lượng cao với giao diện học tương tác'
                        }
                      </p>

                      <div className={styles.learningPage__cardMeta}>
                        <div className={styles.learningPage__cardMetaItem}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          <span>{course.lessonCount || totalLessons} bài học</span>
                        </div>
                        
                        <div className={styles.learningPage__cardMetaItem}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Tương tác</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className={styles.learningPage__cardActions}>
                        <Link
                          to={`/learning/${course._id}`}
                          className={styles.learningPage__cardButton}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                          </svg>
                          Bắt đầu học
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
