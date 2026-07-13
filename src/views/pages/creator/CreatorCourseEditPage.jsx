import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import CreatorOnly from './CreatorOnly';
import { useAuth } from '../../../context/AuthContext';
import {
  getCourseApi,
  updateCourseApi,
  updateModuleApi,
  createModuleApi,
  deleteModuleApi,
  createLessonApi,
  deleteLessonApi,
  createQuizApi,
  updateQuizApi,
  upsertPracticeRoutineApi,
  upsertChallengeSongApi,
  publishCourseApi,
  deleteCourseApi,
} from '../../../services/learningApi';
import CollapsePanel from '../../components/creator/CollapsePanel';
import page from '../courses/LearningLayout.module.css';
import cs from '../courses/Courses.module.css';
import { useConfirm } from '../../../context/ConfirmContext';

const LEVELS = [
  { id: 'beginner', label: 'Cơ bản' },
  { id: 'intermediate', label: 'Trung cấp' },
  { id: 'advanced', label: 'Nâng cao' },
];

const CHALLENGE_LEVELS = [
  { id: 'easy', label: 'Dễ' },
  { id: 'medium', label: 'Trung bình' },
  { id: 'hard', label: 'Khó' },
];

function makeId(prefix = 'q') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function blankQuestion() {
  return { key: makeId('q'), text: '', options: ['', '', '', ''], correctIndex: 0 };
}

function previewText(text, max = 48) {
  const t = (text || '').trim();
  if (!t) return 'Chưa có nội dung';
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function questionCollapseId(moduleId, questionKey) {
  return `${moduleId}:${questionKey}`;
}

function toggleSetItem(setter, id) {
  setter((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}

export default function CreatorCourseEditPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const backPath = isAdmin ? '/admin' : '/creator';
  const backLabel = isAdmin ? '← Bảng điều khiển admin' : '← Khóa của tôi';
  const { confirm } = useConfirm();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [notice, setNotice] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);
  const [courseMeta, setCourseMeta] = useState({
    title: '',
    description: '',
    thumbnail: '',
    level: 'beginner',
    tags: '',
  });
  const [moduleMeta, setModuleMeta] = useState({});
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonForms, setLessonForms] = useState({});
  const [quizDrafts, setQuizDrafts] = useState({});
  const [practiceDrafts, setPracticeDrafts] = useState({});
  const [challengeDrafts, setChallengeDrafts] = useState({});
  const [expandedModules, setExpandedModules] = useState(() => new Set());
  const [expandedQuizSections, setExpandedQuizSections] = useState(() => new Set());
  const [expandedQuestions, setExpandedQuestions] = useState(() => new Set());

  const load = useCallback(async () => {
    const d = await getCourseApi(courseId);
    setData(d);
    setCourseMeta({
      title: d.course?.title || '',
      description: d.course?.description || '',
      thumbnail: d.course?.thumbnail || '',
      level: d.course?.level || 'beginner',
      tags: (d.course?.tags || []).join(', '),
    });

    const lf = {};
    const qd = {};
    const pd = {};
    const cd = {};
    const mm = {};
    (d.modules || []).forEach((mod) => {
      mm[mod.id] = { title: mod.title || '', description: mod.description || '' };
      lf[mod.id] = { title: '', youtubeVideoId: '', content: '', duration: 5 };
      const q = mod.checkpointQuiz;
      qd[mod.id] = q?.questions?.length
        ? q.questions.map((item) => ({
            key: item.key || makeId('q'),
            text: item.text || '',
            options: Array.from({ length: 4 }, (_, i) => item.options?.[i] ?? ''),
            correctIndex: item.correctIndex ?? 0,
          }))
        : [blankQuestion(), blankQuestion(), blankQuestion()];
      pd[mod.id] = {
        exercises: mod.practiceRoutine?.exercises?.length
          ? mod.practiceRoutine.exercises.map((ex) => ({
              title: ex.title || '',
              description: ex.description || '',
              durationMinutes: ex.durationMinutes || 5,
            }))
          : [{ title: 'Khởi động', description: '', durationMinutes: 5 }],
        estimatedMinutes: mod.practiceRoutine?.estimatedMinutes || 15,
      };
      cd[mod.id] = {
        title: mod.challengeSong?.title || '',
        artist: mod.challengeSong?.artist || '',
        youtubeUrl: mod.challengeSong?.youtubeUrl || '',
        difficulty: mod.challengeSong?.difficulty || 'easy',
      };
    });
    setModuleMeta(mm);
    setLessonForms(lf);
    setQuizDrafts(qd);
    setPracticeDrafts(pd);
    setChallengeDrafts(cd);
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

  const saveCourseMeta = async (e) => {
    e?.preventDefault();
    if (!courseMeta.title?.trim()) return setErr('Tiêu đề khóa học là bắt buộc');
    setErr('');
    setSavingMeta(true);
    try {
      await updateCourseApi(courseId, {
        title: courseMeta.title.trim(),
        description: courseMeta.description.trim(),
        thumbnail: courseMeta.thumbnail.trim(),
        level: courseMeta.level,
        tags: courseMeta.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setNotice('Đã lưu thông tin khóa học');
      await load();
    } catch (e2) {
      setErr(e2.message || 'Không lưu được khóa học');
    } finally {
      setSavingMeta(false);
    }
  };

  const saveModuleMeta = async (moduleId) => {
    const m = moduleMeta[moduleId];
    if (!m?.title?.trim()) return setErr('Tên module là bắt buộc');
    setErr('');
    await updateModuleApi(moduleId, {
      title: m.title.trim(),
      description: m.description.trim(),
    });
    setNotice('Đã lưu module');
    await load();
  };

  const addModule = async () => {
    if (!moduleTitle.trim()) return setErr('Nhập tên module');
    setErr('');
    try {
      const res = await createModuleApi({ courseId, title: moduleTitle.trim() });
      const newId = res.module?.id;
      setModuleTitle('');
      setNotice('Đã thêm module');
      await load();
      if (newId) {
        setExpandedModules((prev) => new Set(prev).add(newId));
        setExpandedQuizSections((prev) => new Set(prev).add(newId));
      }
    } catch (e) {
      setErr(e.message || 'Không thêm được module');
    }
  };

  const expandAllModules = () => {
    setExpandedModules(new Set((data?.modules || []).map((m) => m.id)));
  };

  const collapseAllModules = () => {
    setExpandedModules(new Set());
    setExpandedQuizSections(new Set());
    setExpandedQuestions(new Set());
  };

  const expandAllQuestions = (moduleId) => {
    const keys = (quizDrafts[moduleId] || []).map((q) => questionCollapseId(moduleId, q.key));
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => next.add(k));
      return next;
    });
    setExpandedQuizSections((prev) => new Set(prev).add(moduleId));
  };

  const collapseAllQuestions = (moduleId) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      (quizDrafts[moduleId] || []).forEach((q) => next.delete(questionCollapseId(moduleId, q.key)));
      return next;
    });
  };

  const addLesson = async (moduleId) => {
    const f = lessonForms[moduleId] || {};
    if (!f.title?.trim() || !f.youtubeVideoId?.trim()) return setErr('Bài học cần tiêu đề và YouTube');
    setErr('');
    try {
      await createLessonApi({
        moduleId,
        title: f.title.trim(),
        youtubeVideoId: f.youtubeVideoId.trim(),
        content: f.content || '',
        duration: Number(f.duration) || 5,
      });
      setLessonForms((prev) => ({
        ...prev,
        [moduleId]: { title: '', youtubeVideoId: '', content: '', duration: 5 },
      }));
      setNotice('Đã thêm bài học');
      await load();
    } catch (e) {
      setErr(e.message || 'Không thêm được bài học');
    }
  };

  const saveCheckpointQuiz = async (moduleId) => {
    const raw = (quizDrafts[moduleId] || []).filter((q) => q.text?.trim());
    const questions = [];
    for (const q of raw) {
      const options = q.options.map((o) => (o || '').trim()).filter(Boolean);
      if (options.length < 2) {
        setErr('Mỗi câu hỏi cần ít nhất 2 phương án');
        return;
      }
      if (q.correctIndex < 0 || q.correctIndex >= options.length) {
        setErr('Chọn đáp án đúng cho mỗi câu hỏi');
        return;
      }
      questions.push({
        key: q.key,
        text: q.text.trim(),
        options,
        correctIndex: q.correctIndex,
      });
    }
    if (questions.length < 1) return setErr('Quiz cần ít nhất 1 câu');
    setErr('');
    const mod = data.modules.find((m) => m.id === moduleId);
    const body = { moduleId, title: `Kiểm tra — ${mod?.title || 'Module'}`, questions };
    try {
      if (mod?.checkpointQuiz?.id) {
        await updateQuizApi(mod.checkpointQuiz.id, body);
      } else {
        await createQuizApi(body);
      }
      setNotice('Đã lưu bài kiểm tra');
      await load();
    } catch (e) {
      setErr(e.message || 'Không lưu được quiz');
    }
  };

  const savePractice = async (moduleId) => {
    const draft = practiceDrafts[moduleId];
    const exercises = (draft?.exercises || [])
      .filter((ex) => ex.title?.trim())
      .map((ex) => ({
        title: ex.title.trim(),
        description: (ex.description || '').trim(),
        durationMinutes: Math.max(1, Number(ex.durationMinutes) || 5),
      }));
    if (!exercises.length) return setErr('Cần ít nhất một bài tập luyện');
    setErr('');
    try {
      await upsertPracticeRoutineApi({
        moduleId,
        exercises,
        estimatedMinutes: Math.max(1, Number(draft.estimatedMinutes) || 15),
      });
      setNotice('Đã lưu luyện tập');
      await load();
    } catch (e) {
      setErr(e.message || 'Không lưu được luyện tập');
    }
  };

  const saveChallenge = async (moduleId) => {
    const draft = challengeDrafts[moduleId];
    if (!draft.title?.trim() || !draft.youtubeUrl?.trim()) return setErr('Bài thử thách cần tiêu đề và YouTube');
    setErr('');
    try {
      await upsertChallengeSongApi({
        moduleId,
        title: draft.title.trim(),
        artist: (draft.artist || '').trim(),
        youtubeUrl: draft.youtubeUrl.trim(),
        difficulty: draft.difficulty || 'easy',
      });
      setNotice('Đã lưu bài thử thách');
      await load();
    } catch (e) {
      setErr(e.message || 'Không lưu được bài thử thách');
    }
  };

  const doPublish = async () => {
    if (course?.isPublished) return;
    setErr('');
    try {
      await publishCourseApi(courseId);
      setNotice('Đã xuất bản khóa học');
      await load();
    } catch (e) {
      setErr(e.message || 'Không xuất bản được');
    }
  };

  const course = data?.course;

  return (
    <CreatorOnly>
      <div className={page.page}>
        {!isAdmin && <Header />}
        <main className={page.main}>
          {loading ? (
            <p className={page.muted}>Đang tải…</p>
          ) : (
            <div className={page.card}>
              <Link to={backPath} className={page.linkBtn}>
                {backLabel}
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <h1 className={page.title} style={{ margin: 0 }}>
                  Chỉnh sửa khóa học
                </h1>
                {course?.isPublished ? (
                  <span className={`${page.badge} ${page.badgeDone}`}>Đã xuất bản</span>
                ) : (
                  <span className={page.badge}>Nháp</span>
                )}
              </div>
              {notice && <p className={page.success}>{notice}</p>}
              {err && <div className={page.error}>{err}</div>}

              <section className={cs.formBlock}>
                <h2 className={page.h2}>Thông tin khóa học</h2>
                <form onSubmit={saveCourseMeta}>
                  <p style={{ marginBottom: 8, fontWeight: 600 }}>Tiêu đề *</p>
                  <input
                    className={page.option}
                    style={{ width: '100%', marginBottom: 12 }}
                    value={courseMeta.title}
                    onChange={(e) => setCourseMeta((m) => ({ ...m, title: e.target.value }))}
                    required
                  />
                  <p style={{ marginBottom: 8, fontWeight: 600 }}>Mô tả</p>
                  <textarea
                    className={page.option}
                    style={{ width: '100%', minHeight: 80, marginBottom: 12 }}
                    value={courseMeta.description}
                    onChange={(e) => setCourseMeta((m) => ({ ...m, description: e.target.value }))}
                  />
                  <p style={{ marginBottom: 8, fontWeight: 600 }}>Ảnh bìa (URL)</p>
                  <input
                    className={page.option}
                    style={{ width: '100%', marginBottom: 12 }}
                    value={courseMeta.thumbnail}
                    onChange={(e) => setCourseMeta((m) => ({ ...m, thumbnail: e.target.value }))}
                  />
                  {courseMeta.thumbnail && (
                    <img src={courseMeta.thumbnail} alt="" className={cs.thumb} style={{ marginBottom: 12 }} />
                  )}
                  <p style={{ marginBottom: 8, fontWeight: 600 }}>Cấp độ</p>
                  <select
                    className={page.option}
                    style={{ width: '100%', marginBottom: 12 }}
                    value={courseMeta.level}
                    onChange={(e) => setCourseMeta((m) => ({ ...m, level: e.target.value }))}
                  >
                    {LEVELS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                  <p style={{ marginBottom: 8, fontWeight: 600 }}>Tags (phân cách bằng dấu phẩy)</p>
                  <input
                    className={page.option}
                    style={{ width: '100%', marginBottom: 16 }}
                    value={courseMeta.tags}
                    onChange={(e) => setCourseMeta((m) => ({ ...m, tags: e.target.value }))}
                  />
                  <button type="submit" className={page.btnPrimary} disabled={savingMeta}>
                    {savingMeta ? 'Đang lưu…' : 'Lưu thông tin khóa'}
                  </button>
                </form>
              </section>

              <section className={cs.formBlock}>
                <h2 className={page.h2}>Thêm module</h2>
                <input
                  className={page.option}
                  placeholder="Tên module (vd: Tuần 1 — Hợp âm cơ bản)"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                />
                <button type="button" className={page.btnPrimary} style={{ marginTop: 8 }} onClick={addModule}>
                  Thêm module
                </button>
              </section>

              {(data?.modules || []).length > 0 && (
                <div className={cs.lessonToolbar} style={{ marginBottom: 12 }}>
                  <button type="button" className={page.btnGhost} onClick={expandAllModules}>
                    Mở tất cả module
                  </button>
                  <button type="button" className={page.btnGhost} onClick={collapseAllModules}>
                    Thu gọn tất cả
                  </button>
                </div>
              )}

              {(data?.modules || []).map((mod, modIndex) => (
                <CollapsePanel
                  key={mod.id}
                  open={expandedModules.has(mod.id)}
                  onToggle={() => toggleSetItem(setExpandedModules, mod.id)}
                  title={moduleMeta[mod.id]?.title?.trim() || mod.title || `Module ${modIndex + 1}`}
                  meta={`${mod.lessons?.length || 0} bài · ${(quizDrafts[mod.id] || []).length} câu quiz`}
                  className={`${cs.lessonItem} ${!expandedModules.has(mod.id) ? cs.lessonItemCollapsed : ''}`}
                >
                  <input
                    className={page.option}
                    placeholder="Tên module"
                    value={moduleMeta[mod.id]?.title || ''}
                    onChange={(e) =>
                      setModuleMeta((p) => ({
                        ...p,
                        [mod.id]: { ...p[mod.id], title: e.target.value },
                      }))
                    }
                  />
                  <textarea
                    className={page.option}
                    style={{ marginTop: 8, minHeight: 60 }}
                    placeholder="Mô tả module"
                    value={moduleMeta[mod.id]?.description || ''}
                    onChange={(e) =>
                      setModuleMeta((p) => ({
                        ...p,
                        [mod.id]: { ...p[mod.id], description: e.target.value },
                      }))
                    }
                  />
                  <div className={cs.lessonToolbar}>
                    <button type="button" className={page.btnGhost} onClick={() => saveModuleMeta(mod.id)}>
                      Lưu module
                    </button>
                    <button
                      type="button"
                      className={page.btnGhost}
                      onClick={async () => {
                        if (await confirm('Xóa module này?')) {
                          await deleteModuleApi(mod.id);
                          setNotice('Đã xóa module');
                          await load();
                        }
                      }}
                    >
                      Xóa module
                    </button>
                  </div>

                  <h3 className={page.h2} style={{ fontSize: 15, marginTop: 12 }}>
                    Bài học ({mod.lessons?.length || 0})
                  </h3>
                  <ul className={cs.lessonListEdit}>
                    {(mod.lessons || []).map((l) => (
                      <li key={l.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span>
                          {l.title}
                          {l.duration ? (
                            <span className={page.muted} style={{ marginLeft: 6, fontSize: 12 }}>
                              · {l.duration} phút
                            </span>
                          ) : null}
                        </span>
                        <button
                          type="button"
                          className={page.btnGhost}
                          onClick={async () => {
                            await deleteLessonApi(l.id);
                            await load();
                          }}
                        >
                          Xóa
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className={cs.addLessonPanel}>
                    <input
                      className={page.option}
                      placeholder="Tiêu đề bài học"
                      value={lessonForms[mod.id]?.title || ''}
                      onChange={(e) =>
                        setLessonForms((p) => ({
                          ...p,
                          [mod.id]: { ...p[mod.id], title: e.target.value },
                        }))
                      }
                    />
                    <input
                      className={page.option}
                      placeholder="YouTube URL hoặc ID"
                      value={lessonForms[mod.id]?.youtubeVideoId || ''}
                      onChange={(e) =>
                        setLessonForms((p) => ({
                          ...p,
                          [mod.id]: { ...p[mod.id], youtubeVideoId: e.target.value },
                        }))
                      }
                    />
                    <textarea
                      className={page.option}
                      placeholder="Nội dung (markdown đơn giản)"
                      value={lessonForms[mod.id]?.content || ''}
                      onChange={(e) =>
                        setLessonForms((p) => ({
                          ...p,
                          [mod.id]: { ...p[mod.id], content: e.target.value },
                        }))
                      }
                    />
                    <input
                      className={page.option}
                      type="number"
                      min={1}
                      placeholder="Thời lượng (phút)"
                      value={lessonForms[mod.id]?.duration ?? 5}
                      onChange={(e) =>
                        setLessonForms((p) => ({
                          ...p,
                          [mod.id]: { ...p[mod.id], duration: e.target.value },
                        }))
                      }
                    />
                    <button type="button" className={page.btnPrimary} onClick={() => addLesson(mod.id)}>
                      Thêm bài học
                    </button>
                  </div>

                  <h3 className={page.h2} style={{ fontSize: 15, marginTop: 16 }}>
                    Luyện tập
                  </h3>
                  {(practiceDrafts[mod.id]?.exercises || []).map((ex, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <input
                        className={page.option}
                        placeholder="Tên bài tập"
                        value={ex.title}
                        onChange={(e) => {
                          const exs = [...practiceDrafts[mod.id].exercises];
                          exs[i] = { ...exs[i], title: e.target.value };
                          setPracticeDrafts((p) => ({ ...p, [mod.id]: { ...p[mod.id], exercises: exs } }));
                        }}
                      />
                      <input
                        className={page.option}
                        style={{ marginTop: 6 }}
                        placeholder="Mô tả ngắn"
                        value={ex.description || ''}
                        onChange={(e) => {
                          const exs = [...practiceDrafts[mod.id].exercises];
                          exs[i] = { ...exs[i], description: e.target.value };
                          setPracticeDrafts((p) => ({ ...p, [mod.id]: { ...p[mod.id], exercises: exs } }));
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className={page.btnGhost}
                    style={{ marginBottom: 8 }}
                    onClick={() => {
                      setPracticeDrafts((p) => ({
                        ...p,
                        [mod.id]: {
                          ...p[mod.id],
                          exercises: [
                            ...(p[mod.id]?.exercises || []),
                            { title: '', description: '', durationMinutes: 5 },
                          ],
                        },
                      }));
                    }}
                  >
                    + Thêm bài tập
                  </button>
                  <button type="button" className={page.btnGhost} onClick={() => savePractice(mod.id)}>
                    Lưu luyện tập
                  </button>

                  <CollapsePanel
                    open={expandedQuizSections.has(mod.id)}
                    onToggle={() => toggleSetItem(setExpandedQuizSections, mod.id)}
                    title="Kiểm tra (checkpoint)"
                    meta={`${(quizDrafts[mod.id] || []).length} câu`}
                    className={cs.nestedCollapse}
                  >
                    <div className={cs.lessonToolbar} style={{ marginTop: 0, marginBottom: 10 }}>
                      <button type="button" className={page.btnGhost} onClick={() => expandAllQuestions(mod.id)}>
                        Mở tất cả câu
                      </button>
                      <button type="button" className={page.btnGhost} onClick={() => collapseAllQuestions(mod.id)}>
                        Thu gọn câu hỏi
                      </button>
                    </div>
                    {(quizDrafts[mod.id] || []).map((q, qi) => {
                      const qCollapseId = questionCollapseId(mod.id, q.key);
                      return (
                        <CollapsePanel
                          key={q.key}
                          open={expandedQuestions.has(qCollapseId)}
                          onToggle={() => toggleSetItem(setExpandedQuestions, qCollapseId)}
                          title={`Câu ${qi + 1}`}
                          meta={previewText(q.text)}
                          className={cs.questionCardCollapsed}
                        >
                      <input
                        className={page.option}
                        placeholder={`Nội dung câu ${qi + 1}`}
                        value={q.text}
                        onChange={(e) => {
                          const qs = [...quizDrafts[mod.id]];
                          qs[qi] = { ...qs[qi], text: e.target.value };
                          setQuizDrafts((p) => ({ ...p, [mod.id]: qs }));
                        }}
                      />
                      {(q.options || []).map((opt, oi) => (
                        <div key={oi} className={cs.optionRow} style={{ marginTop: 8 }}>
                          <label>
                            <input
                              type="radio"
                              name={`correct_${mod.id}_${q.key}`}
                              checked={q.correctIndex === oi}
                              onChange={() => {
                                const qs = [...quizDrafts[mod.id]];
                                qs[qi] = { ...qs[qi], correctIndex: oi };
                                setQuizDrafts((p) => ({ ...p, [mod.id]: qs }));
                              }}
                            />
                            Đúng
                          </label>
                          <input
                            className={`${page.option} ${cs.optionInput}`}
                            placeholder={`Phương án ${oi + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const qs = [...quizDrafts[mod.id]];
                              const opts = [...qs[qi].options];
                              opts[oi] = e.target.value;
                              qs[qi] = { ...qs[qi], options: opts };
                              setQuizDrafts((p) => ({ ...p, [mod.id]: qs }));
                            }}
                          />
                        </div>
                      ))}
                          <button
                            type="button"
                            className={page.btnGhost}
                            style={{ marginTop: 8 }}
                            onClick={() => {
                              const qs = (quizDrafts[mod.id] || []).filter((_, i) => i !== qi);
                              setQuizDrafts((p) => ({ ...p, [mod.id]: qs }));
                              setExpandedQuestions((prev) => {
                                const next = new Set(prev);
                                next.delete(qCollapseId);
                                return next;
                              });
                            }}
                          >
                            Xóa câu này
                          </button>
                        </CollapsePanel>
                      );
                    })}
                    <div className={cs.quizActions}>
                      <button
                        type="button"
                        className={page.btnGhost}
                        onClick={() => {
                          const newQ = blankQuestion();
                          setQuizDrafts((p) => ({
                            ...p,
                            [mod.id]: [...(p[mod.id] || []), newQ],
                          }));
                          setExpandedQuizSections((prev) => new Set(prev).add(mod.id));
                          setExpandedQuestions((prev) =>
                            new Set(prev).add(questionCollapseId(mod.id, newQ.key)),
                          );
                        }}
                      >
                        + Thêm câu
                      </button>
                      <button type="button" className={page.btnGhost} onClick={() => saveCheckpointQuiz(mod.id)}>
                        Lưu quiz
                      </button>
                    </div>
                  </CollapsePanel>

                  <h3 className={page.h2} style={{ fontSize: 15, marginTop: 16 }}>
                    Bài thử thách
                  </h3>
                  <input
                    className={page.option}
                    placeholder="Tên bài hát"
                    value={challengeDrafts[mod.id]?.title || ''}
                    onChange={(e) =>
                      setChallengeDrafts((p) => ({
                        ...p,
                        [mod.id]: { ...p[mod.id], title: e.target.value },
                      }))
                    }
                  />
                  <input
                    className={page.option}
                    style={{ marginTop: 8 }}
                    placeholder="Nghệ sĩ"
                    value={challengeDrafts[mod.id]?.artist || ''}
                    onChange={(e) =>
                      setChallengeDrafts((p) => ({
                        ...p,
                        [mod.id]: { ...p[mod.id], artist: e.target.value },
                      }))
                    }
                  />
                  <input
                    className={page.option}
                    style={{ marginTop: 8 }}
                    placeholder="YouTube URL"
                    value={challengeDrafts[mod.id]?.youtubeUrl || ''}
                    onChange={(e) =>
                      setChallengeDrafts((p) => ({
                        ...p,
                        [mod.id]: { ...p[mod.id], youtubeUrl: e.target.value },
                      }))
                    }
                  />
                  <select
                    className={page.option}
                    style={{ width: '100%', marginTop: 8 }}
                    value={challengeDrafts[mod.id]?.difficulty || 'easy'}
                    onChange={(e) =>
                      setChallengeDrafts((p) => ({
                        ...p,
                        [mod.id]: { ...p[mod.id], difficulty: e.target.value },
                      }))
                    }
                  >
                    {CHALLENGE_LEVELS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                  <button type="button" className={page.btnGhost} style={{ marginTop: 8 }} onClick={() => saveChallenge(mod.id)}>
                    Lưu bài thử thách
                  </button>
                </CollapsePanel>
              ))}

              <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={page.btnPrimary}
                  onClick={doPublish}
                  disabled={course?.isPublished}
                >
                  {course?.isPublished ? 'Đã xuất bản' : 'Xuất bản khóa học'}
                </button>
                {course?.isPublished && (
                  <Link className={page.btnGhost} to={`/courses/${courseId}`} style={{ textDecoration: 'none' }}>
                    Xem khóa học
                  </Link>
                )}
                <button
                  type="button"
                  className={page.btnGhost}
                  onClick={async () => {
                    if (await confirm('Xóa toàn bộ khóa học?')) {
                      await deleteCourseApi(courseId);
                      navigate(backPath);
                    }
                  }}
                >
                  Xóa khóa học
                </button>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </CreatorOnly>
  );
}
