// src/components/Learning/InteractiveCourseList.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../../services/courseService';
import styles from './InteractiveCourseList.module.css';

/**
 * InteractiveCourseList Component
 * Hiển thị danh sách khóa học tương tác với nút "Bắt đầu học"
 */
export default function InteractiveCourseList() {
  // State management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch courses
  const fetchCourses = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }

      if (selectedLevel) {
        params.level = selectedLevel;
      }

      const response = await getAllCourses(params);
      
      if (response.success) {
        setCourses(response.data.courses || []);
        setPagination(response.data.pagination || null);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(response.message || 'Có lỗi khi tải danh sách khóa học');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Có lỗi khi tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedLevel]);

  // Load courses when component mounts or filters change
  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage, fetchCourses]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle level filter change
  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLevel('');
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p>{error}</p>
        </div>
        <button
          onClick={() => fetchCourses(currentPage)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.interactiveCourseList}>
      <div className={styles.interactiveCourseList__container}>
        {/* Header */}
        <div className={styles.interactiveCourseList__header}>
          <h1 className={styles.interactiveCourseList__title}>Học Guitar Tương Tác</h1>
          <p className={styles.interactiveCourseList__subtitle}>
            Khám phá các khóa học guitar với giao diện học tương tác, metronome và feedback thời gian thực
          </p>
        </div>

        {/* Search and Filter */}
        <div className={styles.interactiveCourseList__filters}>
          <div className={styles.interactiveCourseList__filterRow}>
            {/* Search Input */}
            <div className={styles.interactiveCourseList__searchContainer}>
              <div className={styles.interactiveCourseList__searchWrapper}>
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={styles.interactiveCourseList__searchInput}
                />
                <svg
                  className={styles.interactiveCourseList__searchIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Level Filter */}
            <div className={styles.interactiveCourseList__filterContainer}>
              <select
                value={selectedLevel}
                onChange={handleLevelChange}
                className={styles.interactiveCourseList__filterSelect}
              >
                <option value="">Tất cả cấp độ</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedLevel) && (
            <div className={styles.interactiveCourseList__activeFilters}>
              {searchTerm && (
                <span className={styles.interactiveCourseList__filterTag}>
                  Tìm kiếm: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className={styles.interactiveCourseList__filterRemove}
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedLevel && (
                <span className={styles.interactiveCourseList__filterTag}>
                  Cấp độ: {selectedLevel === 'beginner' ? 'Cơ bản' : selectedLevel === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
                  <button
                    onClick={() => setSelectedLevel('')}
                    className={styles.interactiveCourseList__filterRemove}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        {pagination && (
          <div className={styles.interactiveCourseList__summary}>
            <p className={styles.interactiveCourseList__summaryText}>
              Hiển thị {courses.length} trong tổng số {pagination.totalItems} khóa học
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className={styles.interactiveCourseList__loading}>
            <div className={styles.interactiveCourseList__spinner}></div>
            <p className={styles.interactiveCourseList__loadingText}>Đang tải khóa học...</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          <>
            {courses.length === 0 ? (
              <div className={styles.interactiveCourseList__empty}>
                <div className={styles.interactiveCourseList__emptyIcon}>
                  <svg className={styles.interactiveCourseList__emptySvg} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <p className={styles.interactiveCourseList__emptyTitle}>Không tìm thấy khóa học</p>
                  <p className={styles.interactiveCourseList__emptyMessage}>
                    {(searchTerm || selectedLevel) 
                      ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                      : 'Chưa có khóa học nào được tạo'
                    }
                  </p>
                </div>
                {(searchTerm || selectedLevel) && (
                  <button
                    onClick={clearFilters}
                    className={styles.interactiveCourseList__clearFiltersButton}
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Courses Grid */}
                <div className={styles.interactiveCourseList__grid}>
                  {courses.map((course) => (
                    <InteractiveCourseCard key={course._id} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.interactiveCourseList__pagination}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={styles.interactiveCourseList__paginationButton}
                    >
                      Trước
                    </button>

                    {/* Page Numbers */}
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      const isCurrentPage = page === currentPage;
                      
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`${styles.interactiveCourseList__paginationButton} ${
                              isCurrentPage ? styles.interactiveCourseList__paginationButtonActive : ''
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={styles.interactiveCourseList__paginationButton}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * InteractiveCourseCard Component
 * Card hiển thị khóa học với nút "Bắt đầu học"
 */
function InteractiveCourseCard({ course }) {
  if (!course) {
    return null;
  }

  const {
    _id,
    title,
    description,
    thumbnail,
    level,
    lessonCount = 0,
    createdBy,
    createdAt
  } = course;

  // Get level display text and color
  const getLevelInfo = (level) => {
    switch (level) {
      case 'beginner':
        return { text: 'Cơ bản', color: 'bg-green-100 text-green-800' };
      case 'intermediate':
        return { text: 'Trung bình', color: 'bg-yellow-100 text-yellow-800' };
      case 'advanced':
        return { text: 'Nâng cao', color: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Cơ bản', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const levelInfo = getLevelInfo(level);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Truncate description
  const truncateDescription = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={styles.interactiveCourseCard}>
      {/* Thumbnail */}
      <div className={styles.interactiveCourseCard__media}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className={styles.interactiveCourseCard__image}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`${styles.interactiveCourseCard__placeholder} ${thumbnail ? styles.hidden : ''}`}
        >
          <div className={styles.interactiveCourseCard__placeholderContent}>
            <svg className={styles.interactiveCourseCard__placeholderIcon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={styles.interactiveCourseCard__placeholderText}>Khóa học</p>
          </div>
        </div>
        
        {/* Level Badge */}
        <div className={styles.interactiveCourseCard__levelBadge}>
          <span className={`${styles.interactiveCourseCard__level} ${styles[`level-${level}`]}`}>
            {levelInfo.text}
          </span>
        </div>

        {/* Interactive Badge */}
        <div className={styles.interactiveCourseCard__interactiveBadge}>
          <svg className={styles.interactiveCourseCard__interactiveIcon} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>Tương tác</span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.interactiveCourseCard__content}>
        {/* Title */}
        <h3 className={styles.interactiveCourseCard__title}>
          {title}
        </h3>

        {/* Description */}
        <p className={styles.interactiveCourseCard__description}>
          {truncateDescription(description)}
        </p>

        {/* Course Info */}
        <div className={styles.interactiveCourseCard__info}>
          <div className={styles.interactiveCourseCard__lessonCount}>
            <svg className={styles.interactiveCourseCard__icon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span>{lessonCount} bài học</span>
          </div>
          
          {createdAt && (
            <span className={styles.interactiveCourseCard__date}>{formatDate(createdAt)}</span>
          )}
        </div>

        {/* Features */}
        <div className={styles.interactiveCourseCard__features}>
          <div className={styles.interactiveCourseCard__feature}>
            <svg className={styles.interactiveCourseCard__featureIcon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Metronome</span>
          </div>
          <div className={styles.interactiveCourseCard__feature}>
            <svg className={styles.interactiveCourseCard__featureIcon} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>Tab/Chord</span>
          </div>
          <div className={styles.interactiveCourseCard__feature}>
            <svg className={styles.interactiveCourseCard__featureIcon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Feedback</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.interactiveCourseCard__footer}>
        <Link
          to={`/learning/${_id}`}
          className={styles.interactiveCourseCard__cta}
        >
          <svg className={styles.interactiveCourseCard__ctaIcon} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Bắt đầu học
        </Link>
      </div>
    </div>
  );
}

