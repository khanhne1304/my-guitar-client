import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import InstructorOnly from './InstructorOnly';
import {
  getCourseBuilderApi,
  addModuleApi,
  addLessonApi,
  upsertQuizApi,
  publishCourseApi,
  reorderModulesApi,
  deleteCourseApi,
} from '../../../services/instructorCourseService';
import styles from '../LearningPathPage/LearningPathPage.module.css';

const QUIZ_PLACEHOLDER = `[
  {"key":"q1","text":"Câu hỏi 1?","options":["Đúng","Sai A","Sai B","Sai C"],"correctIndex":0},
  {"key":"q2","text":"Câu hỏi 2?","options":["A","B","C","D"],"correctIndex":1},
  {"key":"q3","text":"Câu hỏi 3?","options":["Một","Hai","Ba","Bốn"],"correctIndex":2}
]`;

export default function CourseBuilderPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [modTitle, setModTitle] = useState('');
  const [lessonForm, setLessonForm] = useState({}); // moduleId -> { title, videoUrl, durationMinutes, content }
  const [quizDraft, setQuizDraft] = useState({});
  const [publishIssues, setPublishIssues] = useState(null);

  const load = useCallback(async () => {
    setErr('');
    const d = await getCourseBuilderApi(courseId);
    setData(d);
    const qd = {};
    (d.modules || []).forEach((m) => {
      if (m.quiz?.questions?.length) {
        qd[m.id] = JSON.stringify(m.quiz.questions, null, 2);
      }
    });
    setQuizDraft(qd);
  }, [courseId]);

  useEffect(() => {
    let c = true;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (c) setErr(e.message || 'Không tải được');
      } finally {
        if (c) setLoading(false);
      }
    })();
    return () => {
      c = false;
    };
  }, [load]);

  const addModule = async () => {
    if (!modTitle.trim()) return;
    setErr('');
    try {
      await addModuleApi({ courseId, title: modTitle.trim() });
      setModTitle('');
      await load();
    } catch (e) {
      setErr(e.message || 'Lỗi thêm học phần');
    }
  };

  const addLesson = async (moduleId) => {
    const f = lessonForm[moduleId] || {};
    if (!f.title?.trim() || !f.videoUrl?.trim()) {
      setErr('Mỗi bài cần tiêu đề và link YouTube');
      return;
    }
    setErr('');
    try {
      await addLessonApi({
        moduleId,
        title: f.title.trim(),
        videoUrl: f.videoUrl.trim(),
        durationMinutes: Number(f.durationMinutes) || 10,
        content: f.content || '',
      });
      setLessonForm((prev) => ({ ...prev, [moduleId]: {} }));
      await load();
    } catch (e) {
      setErr(e.message || 'Lỗi thêm bài');
    }
  };

  const saveQuiz = async (moduleId, moduleTitleText) => {
    const raw = quizDraft[moduleId];
    if (!raw?.trim()) {
      setErr('Nhập JSON câu hỏi');
      return;
    }
    let questions;
    try {
      questions = JSON.parse(raw);
    } catch {
      setErr('JSON quiz không hợp lệ');
      return;
    }
    setErr('');
    try {
      await upsertQuizApi({
        moduleId,
        title: `Kiểm tra: ${moduleTitleText}`,
        questions,
      });
      await load();
    } catch (e) {
      setErr(e.message || 'Lỗi lưu quiz');
    }
  };

  const publish = async () => {
    setErr('');
    setPublishIssues(null);
    try {
      await publishCourseApi(courseId);
      await load();
      alert('Đã xuất bản khóa học.');
    } catch (e) {
      setPublishIssues(e.data?.issues);
      setErr(e.message || 'Chưa đủ điều kiện xuất bản');
    }
  };

  const moveModule = async (index, dir, modules) => {
    const ids = modules.map((m) => m.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[index], next[j]] = [next[j], next[index]];
    try {
      await reorderModulesApi(courseId, next);
      await load();
    } catch (e) {
      setErr(e.message || 'Không sắp xếp được');
    }
  };

  const removeCourse = async () => {
    if (!window.confirm('Xóa vĩnh viễn khóa học này?')) return;
    try {
      await deleteCourseApi(courseId);
      navigate('/instructor', { replace: true });
    } catch (e) {
      setErr(e.message || 'Không xóa được');
    }
  };

  if (loading || !data) {
    return (
      <InstructorOnly>
        <div className={styles.page}>
          <Header />
          <main className={styles.main}>
            <p className={styles.muted}>{loading ? 'Đang tải…' : ''}</p>
          </main>
          <Footer />
        </div>
      </InstructorOnly>
    );
  }

  const { course, modules, publishCheck } = data;

  return (
    <InstructorOnly>
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Link to="/instructor" className={styles.linkBtn}>
                  ← Khóa của tôi
                </Link>
                <h1 className={styles.title}>{course.title}</h1>
                <p className={styles.lead}>
                  Trạng thái:{' '}
                  <strong>{course.isPublished ? 'Đã xuất bản' : 'Nháp'}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a className={styles.btnGhost} href={`/learning/course/${courseId}`} target="_blank" rel="noreferrer">
                  Xem trước (học viên)
                </a>
                <button type="button" className={styles.btnPrimary} onClick={publish} disabled={course.isPublished}>
                  {course.isPublished ? 'Đã xuất bản' : 'Xuất bản'}
                </button>
                <button type="button" className={styles.btnGhost} onClick={removeCourse}>
                  Xóa khóa
                </button>
              </div>
            </div>

            {publishCheck && !publishCheck.ok && (
              <div className={styles.error} style={{ marginTop: 12 }}>
                <strong>Chưa đủ điều kiện xuất bản:</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                  {(publishCheck.issues || []).map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {publishIssues?.length ? (
              <div className={styles.error} style={{ marginTop: 12 }}>
                {publishIssues.map((t, i) => (
                  <div key={i}>{t}</div>
                ))}
              </div>
            ) : null}
            {err && <div className={styles.error}>{err}</div>}

            <h2 className={styles.h2} style={{ marginTop: 24 }}>
              Học phần
            </h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <input
                className={styles.option}
                style={{ flex: 1, minWidth: 200 }}
                placeholder="Tên học phần mới"
                value={modTitle}
                onChange={(e) => setModTitle(e.target.value)}
              />
              <button type="button" className={styles.btnPrimary} onClick={addModule}>
                Thêm học phần
              </button>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {modules.map((m, idx) => (
                <li
                  key={m.id}
                  style={{
                    border: '1px solid #e5dcc8',
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 14,
                    background: '#fffdf7',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0 }}>{m.title}</h3>
                    <span>
                      <button type="button" className={styles.btnGhost} disabled={idx === 0} onClick={() => moveModule(idx, -1, modules)}>
                        ↑
                      </button>
                      <button
                        type="button"
                        className={styles.btnGhost}
                        disabled={idx === modules.length - 1}
                        onClick={() => moveModule(idx, 1, modules)}
                      >
                        ↓
                      </button>
                    </span>
                  </div>
                  <ul className={styles.lessonList}>
                    {(m.lessons || []).map((l) => (
                      <li key={l.id} className={styles.lessonRow}>
                        <span>
                          {l.title} · {l.durationMinutes} phút
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 12, padding: 12, background: '#fff', borderRadius: 8 }}>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>Thêm bài học</p>
                    <input
                      className={styles.option}
                      style={{ width: '100%', marginBottom: 8 }}
                      placeholder="Tiêu đề bài"
                      value={lessonForm[m.id]?.title || ''}
                      onChange={(e) =>
                        setLessonForm((prev) => ({
                          ...prev,
                          [m.id]: { ...prev[m.id], title: e.target.value },
                        }))
                      }
                    />
                    <input
                      className={styles.option}
                      style={{ width: '100%', marginBottom: 8 }}
                      placeholder="Link YouTube (watch hoặc youtu.be)"
                      value={lessonForm[m.id]?.videoUrl || ''}
                      onChange={(e) =>
                        setLessonForm((prev) => ({
                          ...prev,
                          [m.id]: { ...prev[m.id], videoUrl: e.target.value },
                        }))
                      }
                    />
                    <input
                      className={styles.option}
                      style={{ width: 120, marginBottom: 8 }}
                      type="number"
                      min={1}
                      placeholder="Phút"
                      value={lessonForm[m.id]?.durationMinutes || ''}
                      onChange={(e) =>
                        setLessonForm((prev) => ({
                          ...prev,
                          [m.id]: { ...prev[m.id], durationMinutes: e.target.value },
                        }))
                      }
                    />
                    <textarea
                      className={styles.option}
                      style={{ width: '100%', minHeight: 60 }}
                      placeholder="Nội dung text (tuỳ chọn)"
                      value={lessonForm[m.id]?.content || ''}
                      onChange={(e) =>
                        setLessonForm((prev) => ({
                          ...prev,
                          [m.id]: { ...prev[m.id], content: e.target.value },
                        }))
                      }
                    />
                    <button type="button" className={styles.btnPrimary} onClick={() => addLesson(m.id)}>
                      Thêm bài học
                    </button>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>Bài kiểm tra (JSON — 3–5 câu, mỗi câu 4 phương án)</p>
                    <textarea
                      className={styles.option}
                      style={{ width: '100%', minHeight: 140, fontFamily: 'monospace', fontSize: 12 }}
                      placeholder={QUIZ_PLACEHOLDER}
                      value={quizDraft[m.id] ?? ''}
                      onChange={(e) => setQuizDraft((prev) => ({ ...prev, [m.id]: e.target.value }))}
                    />
                    <button type="button" className={styles.btnGhost} style={{ marginTop: 8 }} onClick={() => saveQuiz(m.id, m.title)}>
                      Lưu quiz cho học phần này
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </main>
        <Footer />
      </div>
    </InstructorOnly>
  );
}
