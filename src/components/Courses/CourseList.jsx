import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../../services/courseService';
import CourseCard from './CourseCard';
import styles from './CourseList.module.css';

/**
 * CourseList Component
 * Hiển thị danh sách khóa học với khả năng lọc theo level
 */
export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Load courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getCourses();
        if (response.success) {
          setCourses(response.data.courses || []);
        } else {
          setError(response.message || 'Không thể tải danh sách khóa học');
        }
      } catch (err) {
        console.error('Error loading courses:', err);
        setError(err.message || 'Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Filter and sort courses
  const filteredCourses = courses.filter(course => {
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'level':
        const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return levelOrder[a.level] - levelOrder[b.level];
      case 'lessons':
        return (b.lessonCount || 0) - (a.lessonCount || 0);
      default:
        return 0;
    }
  });

  // Handle level filter change
  const handleLevelChange = (level) => {
    setSelectedLevel(level);
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedLevel('all');
    setSearchTerm('');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className={styles.courseList}>
        <div className={styles.courseList__loading}>
          <div className={styles.courseList__spinner}></div>
          <p className={styles.courseList__loadingText}>Đang tải danh sách khóa học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.courseList}>
        <div className={styles.courseList__error}>
          <div className={styles.courseList__errorIcon}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className={styles.courseList__errorTitle}>Không thể tải khóa học</h2>
          <p className={styles.courseList__errorMessage}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.courseList__errorButton}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.courseList}>

      {/* Filters */}
      <div className={styles.courseList__filters}>
        {/* Search and Filter Toggle */}
        <div className={styles.courseList__searchRow}>
          <div className={styles.courseList__search}>
            <div className={styles.courseList__searchInput}>
              <svg className={styles.courseList__searchIcon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm khóa học guitar..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.courseList__searchField}
              />
            </div>
          </div>
          
          <div className={styles.courseList__filterControls}>
            <button
              className={styles.courseList__filterToggle}
              onClick={toggleFilters}
            >
              <svg className={styles.courseList__filterIcon} fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Bộ lọc
            </button>
            
            <div className={styles.courseList__sortControl}>
              <label className={styles.courseList__sortLabel}>Sắp xếp:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className={styles.courseList__sortSelect}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="title">Tên A-Z</option>
                <option value="level">Trình độ</option>
                <option value="lessons">Số bài học</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className={styles.courseList__advancedFilters}>
            {/* Level Filter */}
            <div className={styles.courseList__levelFilter}>
              <span className={styles.courseList__filterLabel}>Trình độ:</span>
              <div className={styles.courseList__filterButtons}>
                <button
                  className={`${styles.courseList__filterButton} ${selectedLevel === 'all' ? styles.courseList__filterButtonActive : ''}`}
                  onClick={() => handleLevelChange('all')}
                >
                  Tất cả
                </button>
                <button
                  className={`${styles.courseList__filterButton} ${selectedLevel === 'beginner' ? styles.courseList__filterButtonActive : ''}`}
                  onClick={() => handleLevelChange('beginner')}
                >
                  Cơ bản
                </button>
                <button
                  className={`${styles.courseList__filterButton} ${selectedLevel === 'intermediate' ? styles.courseList__filterButtonActive : ''}`}
                  onClick={() => handleLevelChange('intermediate')}
                >
                  Trung cấp
                </button>
                <button
                  className={`${styles.courseList__filterButton} ${selectedLevel === 'advanced' ? styles.courseList__filterButtonActive : ''}`}
                  onClick={() => handleLevelChange('advanced')}
                >
                  Nâng cao
                </button>
              </div>
            </div>
            
            {/* Clear Filters */}
            <div className={styles.courseList__clearFilters}>
              <button
                className={styles.courseList__clearButton}
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className={styles.courseList__results}>
        <div className={styles.courseList__resultsHeader}>
            <p className={styles.courseList__resultsCount}>
            {filteredCourses.length} khóa học guitar
            {selectedLevel !== 'all' && ` (${selectedLevel})`}
            {searchTerm && ` cho "${searchTerm}"`}
          </p>
        </div>

        {filteredCourses.length === 0 ? (
          <div className={styles.courseList__empty}>
            <div className={styles.courseList__emptyIcon}>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className={styles.courseList__emptyTitle}>Không tìm thấy khóa học guitar</h3>
            <p className={styles.courseList__emptyMessage}>
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác
            </p>
          </div>
        ) : (
          <div className={styles.courseList__grid}>
            {filteredCourses.map((course) => (
              <Link
                key={course._id}
                to={`/courses/${course.slug}`}
                className={styles.courseList__cardLink}
              >
                <CourseCard course={course} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}