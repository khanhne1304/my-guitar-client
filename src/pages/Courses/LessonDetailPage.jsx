import React from 'react';
import LessonDetail from '../../components/Courses/LessonDetail';
import Header from '../../views/components/homeItem/Header/Header';
import Footer from '../../views/components/homeItem/Footer/Footer';
import styles from './LessonDetailPage.module.css';

/**
 * LessonDetailPage Component
 * Trang chi tiết bài học
 */
export default function LessonDetailPage() {
  return (
    <div className={styles.lessonDetailPage}>
      <Header />
      
      <main className={styles.lessonDetailPage__content}>
        <div className={styles.lessonDetailPage__container}>
          <LessonDetail />
        </div>
      </main>

      <Footer />
    </div>
  );
}
