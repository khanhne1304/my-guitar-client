import React from 'react';
import BasicGuitarCourse from '../../components/Courses/BasicGuitarCourse';
import Header from '../../views/components/homeItem/Header/Header';
import Footer from '../../views/components/homeItem/Footer/Footer';
import styles from './BasicGuitarPage.module.css';

/**
 * BasicGuitarPage Component
 * Trang khóa học guitar cơ bản
 */
export default function BasicGuitarPage() {
  return (
    <div className={styles.basicGuitarPage}>
      <Header />
      
      <main className={styles.basicGuitarPage__content}>
        <div className={styles.basicGuitarPage__container}>
          <BasicGuitarCourse />
        </div>
      </main>

      <Footer />
    </div>
  );
}
