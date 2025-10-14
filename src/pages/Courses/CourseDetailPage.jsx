// src/pages/Courses/CourseDetailPage.jsx
import CourseDetail from '../../components/Courses/CourseDetail';
import Header from '../../views/components/homeItem/Header/Header';
import Footer from '../../views/components/homeItem/Footer/Footer';
import styles from './CourseDetailPage.module.css';

/**
 * CourseDetailPage Component
 * Trang chi tiết khóa học
 */
export default function CourseDetailPage() {
  return (
    <div className={styles.courseDetailPage}>
      <Header />
      
      <main className={styles.courseDetailPage__content}>
        <div className={styles.courseDetailPage__container}>
          <CourseDetail />
        </div>
      </main>

      <Footer />
    </div>
  );
}
