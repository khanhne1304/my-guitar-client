import React from 'react';
import InteractiveDashboard from '../../components/Learning/InteractiveDashboard';
import styles from './InteractiveLearningPage.module.css';

/**
 * InteractiveLearningPage Component
 * Trang học tương tác chính
 */
export default function InteractiveLearningPage() {
  return (
    <div className={styles.interactiveLearningPage}>
      <InteractiveDashboard />
    </div>
  );
}



