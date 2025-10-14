// src/components/Courses/CourseCard.jsx
import { Link } from 'react-router-dom';
import styles from './CourseCard.module.css';

/**
 * CourseCard Component
 * Hiển thị thông tin cơ bản của một khóa học dạng card
 * 
 * @param {Object} course - Course data object
 * @param {string} course._id - Course ID
 * @param {string} course.title - Course title
 * @param {string} course.description - Course description
 * @param {string} course.thumbnail - Thumbnail URL
 * @param {string} course.level - Course level (beginner, intermediate, advanced)
 * @param {Array} course.lessons - Array of lessons
 * @param {number} course.lessonCount - Number of lessons
 * @param {Object} course.createdBy - Creator info
 * @param {string} course.createdAt - Creation date
 * @param {string} course.updatedAt - Last update date
 */
export default function CourseCard({ course }) {
  if (!course) {
    return null;
  }

  const {
    _id,
    title,
    summary,
    description,
    thumbnail,
    level,
    durationWeeks,
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
    <div className={styles.courseCard}>
      {/* Thumbnail */}
      <div className={styles.courseCard__media}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className={styles.courseCard__image}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`${styles.courseCard__placeholder} ${thumbnail ? styles.hidden : ''}`}
        >
          <div className={styles.courseCard__placeholderContent}>
            <svg className={styles.courseCard__placeholderIcon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={styles.courseCard__placeholderText}>Khóa học</p>
          </div>
        </div>
        
        {/* Level Badge */}
        <div className={styles.courseCard__levelBadge}>
          <span className={`${styles.courseCard__level} ${styles[`level-${level}`]}`}>
            {levelInfo.text}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.courseCard__content}>
        {/* Title */}
        <h3 className={styles.courseCard__title}>
          {title}
        </h3>

        {/* Description */}
        <p className={styles.courseCard__description}>
          {truncateDescription(summary || description)}
        </p>

        {/* Course Info */}
        <div className={styles.courseCard__info}>
          <div className={styles.courseCard__lessonCount}>
            <svg className={styles.courseCard__icon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span>{lessonCount} bài học</span>
          </div>
          
          {durationWeeks && (
            <div className={styles.courseCard__duration}>
              <svg className={styles.courseCard__icon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{durationWeeks} tuần</span>
            </div>
          )}
          
          {createdAt && (
            <span className={styles.courseCard__date}>{formatDate(createdAt)}</span>
          )}
        </div>

        {/* Creator Info */}
        {createdBy && (
          <div className={styles.courseCard__creator}>
            <div className={styles.courseCard__creatorAvatar}>
              <svg className={styles.courseCard__creatorIcon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className={styles.courseCard__creatorName}>
              {createdBy.name || createdBy.email || 'Người dùng'}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.courseCard__footer}>
        <Link
          to={`/courses/${course.slug}`}
          className={styles.courseCard__cta}
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
