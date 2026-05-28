import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getCoursesApi } from '../../../services/learningApi';
import page from './LearningLayout.module.css';
import cs from './Courses.module.css';

const LEVEL_LABEL = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

export default function CourseListPage() {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
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
  }, []);

  return (
    <div className={page.page}>
      <Header />
      <main className={page.main}>
        {loading ? (
          <p className={page.muted}>Đang tải…</p>
        ) : (
          <div className={page.card}>
            <h1 className={page.title}>Khóa học guitar</h1>
            <p className={page.lead}>
              Học từng module — bài ngắn, luyện tập, kiểm tra và bài thử thách.
            </p>
            <p style={{ marginBottom: 16 }}>
              <Link className={page.linkBtn} to="/learn">
                Bảng điều khiển học tập →
              </Link>
            </p>
            {isAuthenticated && (
              <p style={{ marginBottom: 16 }}>
                <Link className={page.btnGhost} to="/creator" style={{ textDecoration: 'none' }}>
                  Quản lý khóa của tôi →
                </Link>
              </p>
            )}
            {err && <div className={page.error}>{err}</div>}
            {!courses.length && !err ? (
              <p className={page.muted}>Chưa có khóa học nào được xuất bản.</p>
            ) : (
              <div className={`${cs.grid} ${cs.grid2}`}>
                {courses.map((c) => (
                  <Link key={c.id} to={`/courses/${c.id}`} className={`${page.card} ${cs.courseCard}`}>
                    {c.thumbnail ? <img src={c.thumbnail} alt="" className={cs.thumb} /> : <div className={cs.thumb} />}
                    <div className={cs.metaRow}>
                      <h2 className={page.h2} style={{ margin: 0 }}>
                        {c.title}
                      </h2>
                      <span className={cs.badge}>{LEVEL_LABEL[c.level] || c.level}</span>
                    </div>
                    {c.description && (
                      <p style={{ margin: '0 0 12px', color: '#5c5346', fontSize: 14, lineHeight: 1.5 }}>
                        {c.description}
                      </p>
                    )}
                    {c.tags?.length > 0 && (
                      <p style={{ margin: '0 0 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {c.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className={cs.badge}>
                            {tag}
                          </span>
                        ))}
                      </p>
                    )}
                    <p className={page.muted} style={{ fontSize: 13, margin: 0 }}>
                      {c.moduleCount ?? 0} module · {c.lessonCount ?? 0} bài ·{' '}
                      {c.creator?.fullName || c.creator?.username || 'Cộng đồng'}
                      {typeof c.progressPercent === 'number' ? ` · Tiến độ ${c.progressPercent}%` : ''}
                    </p>
                    {typeof c.progressPercent === 'number' && c.progressPercent > 0 && (
                      <div className={page.progressBarWrap} style={{ marginTop: 10 }}>
                        <div className={page.progressBar} style={{ width: `${c.progressPercent}%` }} />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
