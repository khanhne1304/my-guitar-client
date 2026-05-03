import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getLessonsApi } from '../../../services/courseLearningService';
import styles from '../LearningPathPage/LearningPathPage.module.css';
import cs from './CourseLearning.module.css';

export default function CourseModulePage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, authChecked } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=/learning/course/${courseId}/module/${moduleId}`, { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      setErr('');
      try {
        const res = await getLessonsApi(moduleId);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Không tải được danh sách bài học');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authChecked, isAuthenticated, courseId, moduleId, navigate]);

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
  const mod = data?.module;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div style={{ marginBottom: 16 }}>
            <Link to={`/learning/course/${courseId}`} className={cs.linkBtn}>
              ← Về khóa học
            </Link>
          </div>
          {err && <div className={styles.error}>{err}</div>}
          {mod?.locked && (
            <div className={styles.error}>
              Học phần đang khóa. Hãy đạt ít nhất 60% bài kiểm tra của học phần trước để mở khóa.
            </div>
          )}
          {course && mod && (
            <>
              <p className={styles.muted} style={{ textAlign: 'left', marginBottom: 4 }}>
                {course.title}
              </p>
              <h1 className={styles.title}>{mod.title}</h1>
              {mod.description && <p className={styles.lead}>{mod.description}</p>}

              <h2 className={styles.h2}>Danh sách bài học</h2>
              <ul className={styles.lessonList}>
                {(data.lessons || []).map((les) => (
                  <li
                    key={les.id}
                    className={`${styles.lessonRow} ${les.locked ? styles.lessonLocked : ''}`}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#2c2416' }}>{les.title}</div>
                      <div className={styles.lessonMeta}>
                        Video · ~{les.durationMinutes} phút
                        {les.completed ? (
                          <span className={`${styles.badge} ${styles.badgeDone}`} style={{ marginLeft: 8 }}>
                            Đã xong
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      {les.locked ? (
                        <span className={`${styles.linkBtn} ${styles.linkBtnMuted}`}>Đã khóa</span>
                      ) : (
                        <Link
                          className={styles.linkBtn}
                          to={`/learning/course/${courseId}/module/${moduleId}/lesson/${les.id}`}
                        >
                          Xem bài
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {!mod.locked && (
                <div style={{ marginTop: 24 }}>
                  {mod.quizEligible ? (
                    <Link className={styles.btnPrimary} to={`/learning/course/${courseId}/module/${moduleId}/quiz`}>
                      Làm kiểm tra học phần
                    </Link>
                  ) : (
                    <span className={`${styles.btnGhost} ${styles.linkBtnMuted}`} style={{ cursor: 'default', opacity: 0.85 }}>
                      Hoàn thành tất cả bài học để mở kiểm tra
                    </span>
                  )}
                  <p className={cs.lockedHint} style={{ marginTop: 10 }}>
                    Cần đạt ít nhất 60% để mở học phần tiếp theo.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
