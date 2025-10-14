// src/components/Courses/CourseHero.jsx
import styles from '../../views/pages/HomePage/HomePage.module.css';

export default function CourseHero() {
  return (
    <section className={styles.home__hero}>
      <div className={styles.home__heroText}>
        <h1>Khóa Học Guitar Chuyên Nghiệp</h1>
        <p>Học guitar từ cơ bản đến nâng cao với các khóa học được thiết kế bởi chuyên gia 🎸</p>
        <div className={styles.home__heroActions}>
          <div style={{ 
            display: 'flex', 
            gap: '2rem', 
            marginTop: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffd700' }}>50+</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Bài học</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffd700' }}>3</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Cấp độ</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffd700' }}>100%</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Miễn phí</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
