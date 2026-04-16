import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getPlacementTestApi, postLearningOnboardingApi } from '../../../services/learningService';
import { needsGuitarOnboarding, GOAL_OPTIONS } from '../../../utils/learningOnboarding';
import { getUser, setUser, mergeUser } from '../../../utils/storage';
import styles from './LearningPathPage.module.css';

export default function LearningPathOnboardingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, authChecked, login: authLogin } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      navigate('/login?redirect=/learning/onboarding', { replace: true });
      return;
    }
    const u = getUser();
    if (!needsGuitarOnboarding(u)) {
      navigate('/learning/roadmap', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getPlacementTestApi();
        const qs = data?.questions || [];
        if (!cancelled) {
          setQuestions(qs);
          if (qs.length === 0) setStep(1);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Không tải được bài test');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authChecked, isAuthenticated, navigate]);

  const onSelectAnswer = (qid, optionIndex) => {
    setAnswers((a) => ({ ...a, [qid]: optionIndex }));
  };

  const toggleGoal = (id) => {
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  };

  const canNextFromQuiz = () => {
    if (step !== 0 || !questions.length) return true;
    return questions.every((q) => answers[q.id] !== undefined && answers[q.id] !== null);
  };

  const handleFinish = async () => {
    setErr('');
    if (goals.length === 0) {
      setErr('Chọn ít nhất một mục tiêu.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await postLearningOnboardingApi({ answers, goals });
      const prev = getUser();
      const merged = mergeUser(
        {
          ...res.user,
          id: res.user?.id ?? prev?.id,
        },
        prev,
      );
      setUser(merged);
      authLogin(merged);
      navigate('/learning/roadmap', { replace: true });
    } catch (e) {
      setErr(e.message || 'Không lưu được. Thử lại.');
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

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Lộ trình học guitar của bạn</h1>
          <p className={styles.lead}>
            Làm bài đánh giá ngắn và chọn mục tiêu — hệ thống sẽ gợi ý module phù hợp.
          </p>

          {err && <div className={styles.error}>{err}</div>}

          {step === 0 && questions.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.h2}>Bài test đầu vào</h2>
              {questions.map((q, i) => (
                <div key={q.id} className={styles.questionBlock}>
                  <p className={styles.qTitle}>
                    {i + 1}. {q.prompt}
                  </p>
                  <div className={styles.options}>
                    {q.options.map((opt, idx) => (
                      <label
                        key={idx}
                        className={`${styles.option} ${answers[q.id] === idx ? styles.optionActive : ''}`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === idx}
                          onChange={() => onSelectAnswer(q.id, idx)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={!canNextFromQuiz()}
                  onClick={() => setStep(1)}
                >
                  Tiếp theo
                </button>
              </div>
            </section>
          )}

          {(step === 1 || !questions.length) && (
            <section className={styles.section}>
              <h2 className={styles.h2}>Mục tiêu học (chọn một hoặc nhiều)</h2>
              <div className={styles.goalGrid}>
                {GOAL_OPTIONS.map((g) => (
                  <label
                    key={g.id}
                    className={`${styles.goalCard} ${goals.includes(g.id) ? styles.goalCardActive : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={goals.includes(g.id)}
                      onChange={() => toggleGoal(g.id)}
                    />
                    <span>{g.label}</span>
                  </label>
                ))}
              </div>
              <p className={styles.hint}>
                Trình độ sẽ được hệ thống xác định từ câu trả lời test (nhóm:{' '}
                <em>Chưa biết — Cơ bản — Nâng cao</em>).
              </p>
              <div className={styles.actions}>
                {questions.length > 0 && (
                  <button type="button" className={styles.btnGhost} onClick={() => setStep(0)}>
                    Quay lại
                  </button>
                )}
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={submitting || goals.length === 0}
                  onClick={handleFinish}
                >
                  {submitting ? 'Đang lưu…' : 'Hoàn tất & xem lộ trình'}
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
