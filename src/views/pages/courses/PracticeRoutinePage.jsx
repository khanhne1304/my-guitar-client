import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getCourseApi, logPracticeApi } from '../../../services/learningApi';
import layout from './LearningLayout.module.css';

export default function PracticeRoutinePage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getCourseApi(courseId);
        const m = (res.modules || []).find((x) => x.id === moduleId);
        if (!cancelled) setMod(m);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Không tải được');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, moduleId]);

  const logDone = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/courses/${courseId}/module/${moduleId}/practice`);
      return;
    }
    setErr('');
    try {
      await logPracticeApi(moduleId, mod?.practiceRoutine?.estimatedMinutes || 15);
      setDone(true);
    } catch (e) {
      setErr(e.message || 'Lỗi lưu tiến độ');
    }
  };

  const routine = mod?.practiceRoutine;

  return (
    <div className={layout.page}>
      <Header />
      <main className={layout.main}>
        <div className={layout.card}>
          <Link to={`/courses/${courseId}`} className={layout.linkBtn}>
            ← Về khóa học
          </Link>
          {loading ? (
            <p className={layout.muted}>Đang tải…</p>
          ) : !routine?.exercises?.length ? (
            <p className={layout.muted} style={{ marginTop: 16 }}>
              Module này chưa có bài luyện tập.
            </p>
          ) : (
            <>
              <h1 className={layout.title} style={{ marginTop: 16 }}>
                Luyện tập — {mod?.title}
              </h1>
              <p className={layout.muted}>Ước tính {routine.estimatedMinutes} phút</p>
              {err && <div className={layout.error}>{err}</div>}
              <ul className={layout.lessonList} style={{ marginTop: 16 }}>
                {routine.exercises.map((ex, i) => (
                  <li
                    key={i}
                    style={{
                      padding: 14,
                      background: '#fff',
                      borderRadius: 10,
                      border: '1px solid #efe4cf',
                    }}
                  >
                    <strong>{ex.title}</strong>
                    {ex.description && (
                      <p className={layout.muted} style={{ margin: '6px 0 0' }}>
                        {ex.description}
                      </p>
                    )}
                    <p className={layout.muted} style={{ fontSize: 12, marginTop: 4 }}>
                      ~{ex.durationMinutes} phút
                    </p>
                  </li>
                ))}
              </ul>
              {done ? (
                <p className={layout.success} style={{ marginTop: 16 }}>
                  Đã ghi nhận buổi luyện tập! +XP
                </p>
              ) : (
                <button type="button" className={layout.btnPrimary} style={{ marginTop: 16 }} onClick={logDone}>
                  Hoàn thành buổi luyện tập
                </button>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
