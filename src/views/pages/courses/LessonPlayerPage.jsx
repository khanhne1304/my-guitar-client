import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getCourseApi, completeLessonApi } from '../../../services/learningApi';
import LessonContent from '../../components/learning/LessonContent';
import layout from './LearningLayout.module.css';
import cs from './Courses.module.css';

function flattenLessons(modules) {
  return (modules || []).flatMap((m) =>
    (m.lessons || []).map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title })),
  );
}

export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reload = async () => {
    const res = await getCourseApi(courseId);
    setData(res);
    return res;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr('');
      try {
        const res = await getCourseApi(courseId);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Không tải được bài học');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  const flat = useMemo(() => flattenLessons(data?.modules), [data]);
  const lesson = flat.find((l) => l.id === lessonId);
  const nextLesson = useMemo(() => {
    const idx = flat.findIndex((l) => l.id === lessonId);
    return idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
  }, [flat, lessonId]);

  const embedUrl = lesson?.youtubeVideoId
    ? `https://www.youtube.com/embed/${lesson.youtubeVideoId}`
    : '';

  const markComplete = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/courses/${courseId}/lesson/${lessonId}`);
      return;
    }
    setErr('');
    setSubmitting(true);
    try {
      const result = await completeLessonApi(lessonId);
      await reload();
      if (result.moduleCompleted) {
        navigate(`/courses/${courseId}/module/${result.moduleId}/complete`);
      }
    } catch (e) {
      setErr(e.message || 'Không lưu được tiến độ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={layout.page}>
      <Header />
      <main className={layout.main}>
        {loading ? (
          <p className={layout.muted}>Đang tải…</p>
        ) : !lesson ? (
          <div className={layout.card}>
            <p>Không tìm thấy bài học.</p>
            <Link className={layout.linkBtn} to={`/courses/${courseId}`}>
              Về khóa học
            </Link>
          </div>
        ) : (
          <div className={layout.card}>
            <Link to={`/courses/${courseId}`} className={layout.linkBtn}>
              ← {data?.course?.title}
            </Link>
            {err && <div className={layout.error}>{err}</div>}
            <p className={layout.muted} style={{ textAlign: 'left', margin: '12px 0 4px' }}>
              {lesson.moduleTitle}
            </p>
            <h1 className={layout.title}>{lesson.title}</h1>
            {embedUrl && (
              <div className={cs.videoWrap}>
                <iframe
                  title={lesson.title}
                  src={embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <LessonContent content={lesson.content} />
            {lesson.completed && (
              <p className={layout.success} style={{ marginTop: 12 }}>
                Bạn đã hoàn thành bài này.
              </p>
            )}
            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button
                type="button"
                className={layout.btnPrimary}
                disabled={submitting || lesson.completed}
                onClick={markComplete}
              >
                {lesson.completed ? 'Đã hoàn thành' : submitting ? 'Đang lưu…' : 'Đánh dấu hoàn thành'}
              </button>
              {nextLesson && (
                <Link
                  className={layout.btnGhost}
                  style={{ textDecoration: 'none' }}
                  to={`/courses/${courseId}/lesson/${nextLesson.id}`}
                >
                  Bài tiếp theo →
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
