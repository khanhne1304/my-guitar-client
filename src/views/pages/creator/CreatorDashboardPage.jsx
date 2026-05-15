import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import CreatorOnly from './CreatorOnly';
import { getMyCoursesApi } from '../../../services/learningApi';
import page from '../courses/LearningLayout.module.css';

export default function CreatorDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let c = true;
    (async () => {
      try {
        const list = await getMyCoursesApi();
        if (c) setCourses(list);
      } catch (e) {
        if (c) setErr(e.message || 'Không tải được');
      } finally {
        if (c) setLoading(false);
      }
    })();
    return () => {
      c = false;
    };
  }, []);

  return (
    <CreatorOnly>
      <div className={page.page}>
        <Header />
        <main className={page.main}>
          <div className={page.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <h1 className={page.title} style={{ margin: 0 }}>
                Khóa học của tôi
              </h1>
              <Link className={page.btnPrimary} to="/creator/course/new" style={{ textDecoration: 'none' }}>
                + Tạo khóa mới
              </Link>
            </div>
            <p className={page.lead}>Tạo khóa học, thêm bài học và bài kiểm tra, sau đó xuất bản để mọi người học.</p>
            {err && <div className={page.error}>{err}</div>}
            {loading ? (
              <p className={page.muted}>Đang tải…</p>
            ) : !courses.length ? (
              <p className={page.muted}>Chưa có khóa nào.</p>
            ) : (
              <ul className={page.lessonList}>
                {courses.map((c) => (
                  <li key={c.id} className={page.lessonRow}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      <div className={page.lessonMeta}>
                        {c.isPublished ? (
                          <span className={`${page.badge} ${page.badgeDone}`}>Đã xuất bản</span>
                        ) : (
                          <span className={page.badge}>Nháp</span>
                        )}
                        {' · '}
                        {c.moduleCount ?? 0} module · {c.lessonCount ?? 0} bài
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link className={page.btnGhost} style={{ textDecoration: 'none' }} to={`/creator/course/${c.id}/edit`}>
                        Chỉnh sửa
                      </Link>
                      <a className={page.btnGhost} href={`/courses/${c.id}`} target="_blank" rel="noreferrer">
                        Xem trước
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </CreatorOnly>
  );
}
