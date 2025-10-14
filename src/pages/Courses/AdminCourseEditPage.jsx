// src/pages/Courses/AdminCourseEditPage.jsx
import CourseForm from '../../components/Courses/CourseForm';
import Header from '../../views/components/homeItem/Header/Header';
import Footer from '../../views/components/homeItem/Footer/Footer';
import styles from './AdminCourseEditPage.module.css';

/**
 * AdminCourseEditPage Component
 * Trang chỉnh sửa khóa học (Admin)
 */
export default function AdminCourseEditPage() {
  return (
    <div className={styles.adminCourseEditPage}>
      <Header />
      
      <main className={styles.adminCourseEditPage__content}>
        <div className={styles.adminCourseEditPage__container}>
          <CourseForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
