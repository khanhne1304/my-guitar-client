import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import {
  getLearningRoadmapApi,
  postCompleteLessonApi,
  postVideoWatchTimeApi,
} from '../../../services/learningService';
import { needsGuitarOnboarding } from '../../../utils/learningOnboarding';
import { getUser } from '../../../utils/storage';
import styles from './LearningPathPage.module.css';

export default function LearningLessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, authChecked } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [quizPick, setQuizPick] = useState({});
  const [videoQuizPick, setVideoQuizPick] = useState({});
  const [recapTab, setRecapTab] = useState('new'); // 'new' | 'old'
  const [submitting, setSubmitting] = useState(false);
  const secondsRef = useRef(0);
  const sentSecondsRef = useRef(0);
  const timerRef = useRef(null);
  const activeRef = useRef(false);

  const lesson = useMemo(() => {
    if (!roadmap?.modules || !lessonId) return null;
    for (const m of roadmap.modules) {
      const l = m.lessons.find((x) => x.id === lessonId);
      if (l) return { module: m, lesson: l };
    }
    return null;
  }, [roadmap, lessonId]);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=/learning/lesson/${lessonId}`, { replace: true });
      return;
    }
    const u = getUser();
    if (needsGuitarOnboarding(u)) {
      navigate('/learning/onboarding', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getLearningRoadmapApi();
        if (!cancelled) setRoadmap(data);
      } catch (e) {
        if (!cancelled) {
          if (e.status === 403) navigate('/learning/onboarding', { replace: true });
          else setErr(e.message || 'Lỗi tải dữ liệu');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authChecked, isAuthenticated, navigate, lessonId]);

  // Auto ghi nhận thời gian luyện tập theo thời gian thực ở trang bài học
  useEffect(() => {
    // chỉ tính khi đã load và có bài học hợp lệ
    if (!authChecked || loading || !lesson || lesson?.lesson?.locked) return;
    // chỉ tính thời gian xem video
    if (lesson?.lesson?.type !== 'video') return;

    const start = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      timerRef.current = window.setInterval(() => {
        secondsRef.current += 1;
      }, 1000);
    };

    const stop = () => {
      activeRef.current = false;
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };

    // bắt đầu ngay khi vào trang (nếu tab đang active)
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVis);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      stop();
      // flush best-effort khi rời trang bài học
      const delta = Math.max(0, secondsRef.current - sentSecondsRef.current);
      const minutes = Math.floor(delta / 60);
      if (minutes >= 1) {
        sentSecondsRef.current += minutes * 60;
        postVideoWatchTimeApi(minutes).catch(() => {});
      }
    };
  }, [authChecked, loading, lesson]);

  const flushPracticeMinutes = async () => {
    const delta = Math.max(0, secondsRef.current - sentSecondsRef.current);
    const minutes = Math.floor(delta / 60);
    if (minutes < 1) return;
    sentSecondsRef.current += minutes * 60;
    await postVideoWatchTimeApi(minutes);
  };

  const completeVideoOrExercise = async () => {
    setErr('');
    setSubmitting(true);
    try {
      await flushPracticeMinutes();
      await postCompleteLessonApi({ lessonId });
      navigate('/learning/roadmap');
    } catch (e) {
      setErr(e.message || 'Không đánh dấu hoàn thành được');
    } finally {
      setSubmitting(false);
    }
  };

  const submitVideoMiniQuizAndComplete = async () => {
    setErr('');
    setSubmitting(true);
    try {
      await flushPracticeMinutes();
      await postCompleteLessonApi({ lessonId, quizAnswers: videoQuizPick });
      navigate('/learning/roadmap');
    } catch (e) {
      setErr(e.message || 'Chưa đạt hoặc lỗi gửi bài');
    } finally {
      setSubmitting(false);
    }
  };

  const submitQuiz = async () => {
    setErr('');
    setSubmitting(true);
    try {
      await flushPracticeMinutes();
      await postCompleteLessonApi({ lessonId, quizAnswers: quizPick });
      navigate('/learning/roadmap');
    } catch (e) {
      setErr(e.message || 'Chưa đạt hoặc lỗi gửi bài');
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
            <Link to="/learning/roadmap">Về lộ trình</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { lesson: les, module: mod } = lesson;

  if (les.locked) {
    const progressText =
      les.unlockProgress && typeof les.unlockProgress.current === 'number' && typeof les.unlockProgress.total === 'number'
        ? `Tiến độ mở khóa: ${les.unlockProgress.current}/${les.unlockProgress.total}`
        : null;
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <h1 className={styles.title}>Bài học bị khóa</h1>
            <p className={styles.lead}>Hoàn thành bài học trước trong lộ trình để mở khóa.</p>
            {progressText && <p className={styles.hint}>{progressText}</p>}
            <Link to="/learning/roadmap" className={styles.btnPrimary} style={{ display: 'inline-block' }}>
              Về lộ trình
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const lesType = les.type;
  const recapNew = les.videoRecap?.newKnowledge || [];
  const recapOld = les.videoRecap?.oldKnowledge || [];
  const recapTitle = recapTab === 'new' ? 'Tóm tắt kiến thức mới' : 'Kiến thức cần biết (ôn lại)';
  const recapItems = recapTab === 'new' ? recapNew : recapOld;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.topBar}>
            <div>
              <p className={styles.muted} style={{ textAlign: 'left', marginBottom: 4 }}>
                {mod.title}
              </p>
              <h1 className={styles.title}>{les.title}</h1>
              {les.summary && <p className={styles.lead}>{les.summary}</p>}
            </div>
            <Link to="/learning/roadmap" className={styles.btnGhost}>
              Lộ trình
            </Link>
          </div>

          {err && <div className={styles.error}>{err}</div>}

          {les.completed && (
            <p className={styles.hint} style={{ color: '#1e6b2f' }}>
              Bạn đã hoàn thành bài này. Có thể ôn lại nội dung bên dưới.
            </p>
          )}

          {lesType === 'video' && les.contentUrl && (
            <div className={styles.videoWrap}>
              <iframe
                title={les.title}
                src={les.contentUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {lesType === 'video' && (
            <>
              <div className={styles.recapPanel}>
                <div className={styles.recapTabs}>
                  <button
                    type="button"
                    className={`${styles.recapTab} ${recapTab === 'new' ? styles.recapTabActive : ''}`}
                    onClick={() => setRecapTab('new')}
                  >
                    Kiến thức mới
                  </button>
                  <button
                    type="button"
                    className={`${styles.recapTab} ${recapTab === 'old' ? styles.recapTabActive : ''}`}
                    onClick={() => setRecapTab('old')}
                  >
                    Kiến thức cần biết
                  </button>
                </div>
                <h3 className={styles.recapTitle}>{recapTitle}</h3>
                {recapItems.length ? (
                  <ul className={styles.recapList}>
                    {recapItems.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.muted} style={{ textAlign: 'left', margin: 0 }}>
                    (Chưa có nội dung)
                  </p>
                )}
              </div>

              {les.videoQuiz?.questions?.length ? (
                <section className={styles.section}>
                  <h2 className={styles.h2} style={{ marginTop: 18 }}>
                    Kiểm tra sau bài học
                  </h2>
                  {les.videoQuiz.questions.map((q, i) => (
                    <div key={q.id} className={styles.questionBlock}>
                      <p className={styles.qTitle}>
                        {i + 1}. {q.text}
                      </p>
                      <div className={styles.options}>
                        {q.options.map((opt, idx) => (
                          <label
                            key={idx}
                            className={`${styles.option} ${videoQuizPick[q.id] === idx ? styles.optionActive : ''}`}
                          >
                            <input
                              type="radio"
                              name={`v_${q.id}`}
                              checked={videoQuizPick[q.id] === idx}
                              onChange={() => setVideoQuizPick((p) => ({ ...p, [q.id]: idx }))}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              ) : null}
            </>
          )}

          {lesType === 'exercise' && les.body && (
            <div className={styles.exerciseBody}>{les.body}</div>
          )}

          {lesType === 'quiz' && les.quiz?.questions && (
            <section className={styles.section}>
              {les.quiz.questions.map((q, i) => (
                <div key={q.id} className={styles.questionBlock}>
                  <p className={styles.qTitle}>
                    {i + 1}. {q.text}
                  </p>
                  <div className={styles.options}>
                    {q.options.map((opt, idx) => (
                      <label
                        key={idx}
                        className={`${styles.option} ${quizPick[q.id] === idx ? styles.optionActive : ''}`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={quizPick[q.id] === idx}
                          onChange={() => setQuizPick((p) => ({ ...p, [q.id]: idx }))}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          <div className={styles.actions}>
            {lesType === 'quiz' ? (
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={
                  submitting ||
                  !les.quiz?.questions?.every((q) => quizPick[q.id] !== undefined)
                }
                onClick={submitQuiz}
              >
                {submitting ? 'Đang nộp…' : 'Nộp bài & hoàn thành'}
              </button>
            ) : lesType === 'video' && les.videoQuiz?.questions?.length ? (
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={
                  submitting ||
                  !les.videoQuiz.questions.every((q) => videoQuizPick[q.id] !== undefined)
                }
                onClick={submitVideoMiniQuizAndComplete}
              >
                {submitting ? 'Đang chấm…' : 'Hoàn thành bài'}
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={submitting}
                onClick={completeVideoOrExercise}
              >
                {submitting ? 'Đang lưu…' : 'Hoàn thành bài'}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
