import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getModulesApi } from '../../../services/courseLearningService';
import styles from '../LearningPathPage/LearningPathPage.module.css';
import cs from './CourseLearning.module.css';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, authChecked } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=/learning/course/${courseId}`, { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      setErr('');
      try {
        const res = await getModulesApi(courseId);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Không tải được học phần');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authChecked, isAuthenticated, courseId, navigate]);

  if (!authChecked || loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <p className={styles.muted}>Đang tải…</p>
        </main>
        <Footer />
      </div>
    );
  }

  const course = data?.course;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div style={{ marginBottom: 16 }}>
            <Link to="/learning/course" className={cs.linkBtn}>
              ← Các khóa học
            </Link>
          </div>
          {err && <div className={styles.error}>{err}</div>}
          {course && (
            <>
              <h1 className={styles.title}>{course.title}</h1>
              <p className={styles.lead}>
                {course.subtitle}
                {course.levelLabel ? (
                  <>
                    {' '}
                    <span className={cs.badge}>{course.levelLabel}</span>
                  </>
                ) : null}
              </p>
              {course.description && <p style={{ color: '#5c5346', lineHeight: 1.55 }}>{course.description}</p>}
              <div style={{ marginTop: 18 }}>
                <div className={styles.progressBarWrap}>
                  <div className={styles.progressBar} style={{ width: `${data.progressPercent || 0}%` }} />
                </div>
                <p style={{ marginTop: 8, fontSize: 14, color: '#6b6258' }}>Tiến độ khóa: {data.progressPercent}%</p>
              </div>

              <h2 className={styles.h2} style={{ marginTop: 28 }}>
                Học phần
              </h2>
              {(data.modules || []).map((m) => (
                <div key={m.id} className={cs.moduleRow}>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#2c2416' }}>{m.title}</h3>
                    {m.description && (
                      <p className={cs.lockedHint} style={{ maxWidth: 560 }}>
                        {m.description}
                      </p>
                    )}
                    <div className={styles.progressBarWrap} style={{ marginTop: 10, maxWidth: 320 }}>
                      <div className={styles.progressBar} style={{ width: `${m.progressPercent}%` }} />
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#8a8075' }}>
                      Bài học: {m.completedLessonCount}/{m.lessonCount} · Tiến độ học phần {m.progressPercent}%
                    </p>
                    {m.locked && (
                      <p className={cs.lockedHint}>Đang khóa — làm kiểm tra học phần trước (≥60%) để mở khóa.</p>
                    )}
                  </div>
                  <div className={cs.moduleActions}>
                    {!m.locked ? (
                      <Link className={styles.btnPrimary} style={{ textAlign: 'center' }} to={`/learning/course/${courseId}/module/${m.id}`}>
                        Vào bài học
                      </Link>
                    ) : (
                      <span className={`${styles.btnGhost} ${styles.linkBtnMuted}`} style={{ cursor: 'not-allowed', opacity: 0.7 }}>
                        Đã khóa
                      </span>
                    )}
                    {!m.locked && m.quizAvailable && (
                      <Link className={styles.btnGhost} to={`/learning/course/${courseId}/module/${m.id}/quiz`}>
                        {m.quizTaken ? (m.quizPassed ? 'Đã đạt kiểm tra ✓' : 'Làm lại kiểm tra') : 'Làm kiểm tra học phần'}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
