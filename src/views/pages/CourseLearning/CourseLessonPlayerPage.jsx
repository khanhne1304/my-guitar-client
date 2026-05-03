import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getLessonsApi, postCourseCompleteLessonApi } from '../../../services/courseLearningService';
import styles from '../LearningPathPage/LearningPathPage.module.css';
import cs from './CourseLearning.module.css';

export default function CourseLessonPlayerPage() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, authChecked } = useAuth();
  const [data, setData] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=/learning/course/${courseId}/module/${moduleId}/lesson/${lessonId}`, {
        replace: true,
      });
      return;
    }
    let cancelled = false;
    (async () => {
      setErr('');
      try {
        const res = await getLessonsApi(moduleId);
        if (cancelled) return;
        setData(res);
        const found = (res.lessons || []).find((l) => l.id === lessonId);
        setLesson(found || null);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Không tải được bài học');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authChecked, isAuthenticated, courseId, moduleId, lessonId, navigate]);

  const markComplete = async () => {
    setErr('');
    setSubmitting(true);
    try {
      await postCourseCompleteLessonApi(lessonId);
      const res = await getLessonsApi(moduleId);
      setData(res);
      const found = (res.lessons || []).find((l) => l.id === lessonId);
      setLesson(found || null);
    } catch (e) {
      setErr(e.message || 'Không lưu được tiến độ');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!lesson) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <p>Không tìm thấy bài học.</p>
            <Link to={`/learning/course/${courseId}/module/${moduleId}`}>Về học phần</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (lesson.locked) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <h1 className={styles.title}>Bài học đang khóa</h1>
            <p className={styles.lead}>Hãy hoàn thành bài học trước trong lộ trình khóa học.</p>
            <Link className={styles.btnPrimary} to={`/learning/course/${courseId}/module/${moduleId}`}>
              Về học phần
            </Link>
          </div>
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
            <Link to={`/learning/course/${courseId}/module/${moduleId}`} className={cs.linkBtn}>
              ← Về học phần
            </Link>
          </div>
          {err && <div className={styles.error}>{err}</div>}
          <p className={styles.muted} style={{ textAlign: 'left', marginBottom: 4 }}>
            {course?.title} · {mod?.title}
          </p>
          <h1 className={styles.title}>{lesson.title}</h1>
          {lesson.description && <p className={styles.lead}>{lesson.description}</p>}

          <div className={cs.videoWrap}>
            <iframe title={lesson.title} src={lesson.videoEmbedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>

          {lesson.content ? (
            <div className={styles.section} style={{ marginTop: 8 }}>
              <h2 className={styles.h2}>Nội dung bài học</h2>
              <div style={{ whiteSpace: 'pre-wrap', color: '#3d3428', lineHeight: 1.6 }}>
                {lesson.content}
              </div>
            </div>
          ) : null}

          {lesson.completed && (
            <p style={{ color: '#1e6b2f', fontWeight: 600 }}>Bạn đã hoàn thành bài này.</p>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.btnPrimary} disabled={submitting || lesson.completed} onClick={markComplete}>
              {lesson.completed ? 'Đã hoàn thành' : submitting ? 'Đang lưu…' : 'Đánh dấu đã học xong'}
            </button>
            <Link className={styles.btnGhost} to={`/learning/course/${courseId}/module/${moduleId}/quiz`}>
              Đến bài kiểm tra học phần
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
