// src/pages/Courses/AdminCourseNewPage.jsx
import CourseForm from '../../components/Courses/CourseForm';
import Header from '../../views/components/homeItem/Header/Header';
import Footer from '../../views/components/homeItem/Footer/Footer';
import styles from './AdminCourseNewPage.module.css';

/**
 * AdminCourseNewPage Component
 * Trang tạo khóa học mới (Admin)
 */
export default function AdminCourseNewPage() {
  return (
    <div className={styles.adminCourseNewPage}>
      <Header />
      
      <main className={styles.adminCourseNewPage__content}>
        <div className={styles.adminCourseNewPage__container}>
          <CourseForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
