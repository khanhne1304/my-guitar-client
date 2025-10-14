// src/pages/Courses/CoursesPage.jsx
import CourseList from '../../components/Courses/CourseList';
import CourseHero from '../../components/Courses/CourseHero';
import Header from '../../views/components/homeItem/Header/Header';
import Footer from '../../views/components/homeItem/Footer/Footer';
import Section from '../../views/components/home/Section';
import styles from './CoursesPage.module.css';

/**
 * CoursesPage Component
 * Trang danh sách tất cả khóa học với layout giống trang chủ
 */
export default function CoursesPage() {
  return (
    <div className={styles.coursesPage}>
      <Header />
      
      <main className={styles.coursesPage__content}>
        <div className={styles.coursesPage__container}>
          {/* Hero Section cho khóa học */}
          <CourseHero />
          
          {/* Section khóa học */}
          <Section title="Danh Sách Khóa Học">
            <CourseList />
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
