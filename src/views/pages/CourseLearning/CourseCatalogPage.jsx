import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getCoursesApi } from '../../../services/courseLearningService';
import styles from '../LearningPathPage/LearningPathPage.module.css';
import cs from './CourseLearning.module.css';

export default function CourseCatalogPage() {
  const navigate = useNavigate();
  const { isAuthenticated, authChecked } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      navigate('/login?redirect=/learning/course', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      setErr('');
      try {
        const list = await getCoursesApi();
        if (!cancelled) setCourses(list);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Không tải được danh sách khóa học');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authChecked, isAuthenticated, navigate]);

  if (!authChecked || loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <p className={styles.muted}>Đang tải khóa học…</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Lộ trình học guitar</h1>
          <p className={styles.lead}>
            Các khóa có video bài học, kiểm tra cuối học phần và theo dõi tiến độ. Đạt tối thiểu 60% bài kiểm tra để mở
            học phần tiếp theo.
          </p>
          <p style={{ margin: '0 0 20px' }}>
            <Link className={styles.linkBtn} to="/learning/paths">
              Lộ trình tự tạo (ghi bước luyện tập của riêng bạn)
            </Link>
          </p>
          {err && <div className={styles.error}>{err}</div>}
          {!courses.length && !err ? (
            <p className={styles.muted}>Chưa có khóa học được xuất bản.</p>
          ) : (
            <div className={`${cs.grid} ${cs.grid2}`}>
              {courses.map((c) => (
                <Link key={c.id} to={`/learning/course/${c.id}`} className={`${styles.card} ${cs.courseCard}`}>
                  <div className={cs.metaRow}>
                    <h2 className={styles.h2} style={{ margin: 0 }}>
                      {c.title}
                    </h2>
                    <span className={cs.badge}>{c.levelLabel || 'Khóa học'}</span>
                  </div>
                  {c.subtitle && <p className={styles.lead}>{c.subtitle}</p>}
                  {c.description && (
                    <p style={{ margin: '0 0 12px', color: '#5c5346', fontSize: 14, lineHeight: 1.5 }}>{c.description}</p>
                  )}
                  <div className={styles.progressBarWrap}>
                    <div className={styles.progressBar} style={{ width: `${c.progressPercent || 0}%` }} />
                  </div>
                  <p style={{ margin: '10px 0 0', fontSize: 13, color: '#7a7165' }}>
                    Tiến độ: {c.progressPercent ?? 0}% · {c.completedLessons ?? 0}/{c.totalLessons ?? 0} bài học
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
