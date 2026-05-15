import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getDashboardApi, getCoursesApi } from '../../../services/learningApi';
import StatCard from '../../components/learning/StatCard';
import ProgressBar from '../../components/learning/ProgressBar';
import layout from './LearningLayout.module.css';
import cs from './Courses.module.css';

const LEVEL_LABEL = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

export default function LearningDashboardPage() {
  const { isAuthenticated } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr('');
      try {
        const [dash, list] = await Promise.all([
          isAuthenticated ? getDashboardApi().catch(() => null) : null,
          getCoursesApi(),
        ]);
        if (!cancelled) {
          setDashboard(dash);
          setCourses(list);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Không tải được dữ liệu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const stats = dashboard?.stats || { streakDays: 0, totalPracticeMinutes: 0, xp: 0 };
  const cont = dashboard?.continueLearning;

  return (
    <div className={layout.page}>
      <Header />
      <main className={`${layout.main} ${layout.mainWide}`}>
        {loading ? (
          <p className={layout.muted}>Đang tải…</p>
        ) : (
          <div className={layout.card}>
            <h1 className={layout.title}>Học guitar mỗi ngày</h1>
            <p className={layout.lead}>
              Bài học ngắn, lộ trình rõ ràng — học từng bước như JustinGuitar.
            </p>
            {err && <div className={layout.error}>{err}</div>}

            {isAuthenticated ? (
              <div className={layout.statGrid}>
                <StatCard value={stats.streakDays} label="Ngày liên tiếp" icon="🔥" />
                <StatCard value={stats.xp} label="Tổng XP" icon="⭐" />
                <StatCard value={stats.totalPracticeMinutes} label="Phút luyện tập" icon="🎸" />
              </div>
            ) : (
              <p className={layout.muted}>
                <Link to="/login?redirect=/learn">Đăng nhập</Link> để theo dõi streak và XP.
              </p>
            )}

            {cont && (
              <section style={{ marginTop: 24, padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #e5dcc8' }}>
                <h2 className={layout.h2}>Tiếp tục học</h2>
                <p style={{ margin: '0 0 8px', color: '#2c2416', fontWeight: 600 }}>{cont.courseTitle}</p>
                <p className={layout.muted} style={{ marginBottom: 12 }}>
                  {cont.moduleTitle} · {cont.lessonTitle}
                </p>
                <ProgressBar percent={cont.progressPercent} />
                <Link
                  className={layout.btnPrimary}
                  style={{ marginTop: 14, textDecoration: 'none' }}
                  to={`/courses/${cont.courseId}/lesson/${cont.lessonId}`}
                >
                  Tiếp tục bài học →
                </Link>
              </section>
            )}

            <h2 className={layout.h2} style={{ marginTop: 28 }}>
              Khóa học
            </h2>
            {!courses.length ? (
              <p className={layout.muted}>Chưa có khóa học nào.</p>
            ) : (
              <div className={`${cs.grid} ${cs.grid2}`}>
                {courses.slice(0, 6).map((c) => (
                  <Link key={c.id} to={`/courses/${c.id}`} className={`${layout.card} ${cs.courseCard}`}>
                    {c.thumbnail ? <img src={c.thumbnail} alt="" className={cs.thumb} /> : <div className={cs.thumb} />}
                    <div className={cs.metaRow}>
                      <h3 className={layout.h2} style={{ margin: 0, fontSize: 17 }}>
                        {c.title}
                      </h3>
                      <span className={cs.badge}>{LEVEL_LABEL[c.level] || c.level}</span>
                    </div>
                    {c.description && (
                      <p style={{ margin: '0 0 10px', color: '#5c5346', fontSize: 13, lineHeight: 1.45 }}>
                        {c.description.length > 100 ? `${c.description.slice(0, 100)}…` : c.description}
                      </p>
                    )}
                    <p className={layout.muted} style={{ fontSize: 12, margin: '0 0 8px' }}>
                      {c.moduleCount ?? 0} module · {c.lessonCount ?? 0} bài
                    </p>
                    <ProgressBar percent={c.progressPercent} label={`${c.progressPercent || 0}% hoàn thành`} />
                  </Link>
                ))}
              </div>
            )}
            <p style={{ marginTop: 16 }}>
              <Link to="/courses" className={layout.linkBtn}>
                Xem tất cả khóa học →
              </Link>
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
