import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { getCourseApi } from '../../../services/learningApi';
import layout from './LearningLayout.module.css';

export default function ModuleCompletePage() {
  const { courseId, moduleId } = useParams();
  const [mod, setMod] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getCourseApi(courseId);
        const m = (res.modules || []).find((x) => x.id === moduleId);
        if (!cancelled) {
          setMod(m);
          setCourseTitle(res.course?.title || '');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, moduleId]);

  return (
    <div className={layout.page}>
      <Header />
      <main className={layout.main}>
        <div className={`${layout.card} ${layout.completeBanner}`}>
          {loading ? (
            <p className={layout.muted}>Đang tải…</p>
          ) : (
            <>
              <div className={layout.completeIcon}>🎉</div>
              <h1 className={layout.title}>Module hoàn thành!</h1>
              <p className={layout.lead}>
                {mod?.title} · {courseTitle}
              </p>
              <p className={layout.muted} style={{ marginBottom: 20 }}>
                Bạn đã hoàn thành tất cả bài học và vượt qua bài kiểm tra.
              </p>
              {mod?.challengeSong && (
                <Link
                  to={`/courses/${courseId}/module/${moduleId}/challenge`}
                  className={layout.btnPrimary}
                  style={{ textDecoration: 'none', marginRight: 8 }}
                >
                  Chơi bài thử thách
                </Link>
              )}
              <Link to={`/courses/${courseId}`} className={layout.btnGhost} style={{ textDecoration: 'none' }}>
                Tiếp tục khóa học
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
