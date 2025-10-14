// src/pages/Learning/LearningPage.jsx
import InteractiveCourseList from '../../components/Learning/InteractiveCourseList';
import styles from './LearningPage.module.css';

/**
 * LearningPage Component
 * Trang học guitar tương tác
 */
export default function LearningPage() {
  return (
    <div className={styles.learningPage}>
      <InteractiveCourseList />
    </div>
  );
}







