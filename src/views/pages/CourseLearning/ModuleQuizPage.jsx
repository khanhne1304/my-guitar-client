import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getModuleQuizApi, postCourseQuizSubmitApi } from '../../../services/courseLearningService';
import styles from '../LearningPathPage/LearningPathPage.module.css';
import cs from './CourseLearning.module.css';

export default function ModuleQuizPage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, authChecked } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=/learning/course/${courseId}/module/${moduleId}/quiz`, { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      setErr('');
      try {
        const data = await getModuleQuizApi(moduleId);
        if (!cancelled) setQuiz(data);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Không tải được bài kiểm tra');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authChecked, isAuthenticated, courseId, moduleId, navigate]);

  const toggle = (key, idx) => {
    setAnswers((a) => ({ ...a, [key]: idx }));
  };

  const submit = async () => {
    setErr('');
    setSubmitting(true);
    setResult(null);
    try {
      const res = await postCourseQuizSubmitApi(moduleId, answers);
      setResult(res);
    } catch (e) {
      setErr(e.message || 'Gửi bài thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered =
    quiz?.questions?.length > 0 &&
    quiz.questions.every((q) => typeof answers[q.key] === 'number');

  if (!authChecked || loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <p className={styles.muted}>Đang tải bài kiểm tra…</p>
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
          <div style={{ marginBottom: 16 }}>
            <Link to={`/learning/course/${courseId}/module/${moduleId}`} className={cs.linkBtn}>
              ← Về danh sách bài học
            </Link>
          </div>

          {err && <div className={styles.error}>{err}</div>}

          {quiz && (
            <>
              <h1 className={styles.title}>{quiz.title}</h1>
              <p className={styles.lead}>
                Trả lời đủ các câu. Cần đạt tối thiểu {quiz.passPercentRequired}% để mở học phần tiếp theo.
              </p>

              <section className={styles.section}>
                {quiz.questions.map((q, i) => (
                  <div key={q.key} className={styles.questionBlock}>
                    <p className={styles.qTitle}>
                      {i + 1}. {q.text}
                    </p>
                    <div className={styles.options}>
                      {q.options.map((opt, idx) => (
                        <label
                          key={idx}
                          className={`${styles.option} ${answers[q.key] === idx ? styles.optionActive : ''}`}
                        >
                          <input
                            type="radio"
                            name={q.key}
                            checked={answers[q.key] === idx}
                            onChange={() => toggle(q.key, idx)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              <div className={styles.actions}>
                <button type="button" className={styles.btnPrimary} disabled={submitting || !allAnswered} onClick={submit}>
                  {submitting ? 'Đang nộp…' : 'Nộp bài'}
                </button>
              </div>

              {result && (
                <div
                  className={`${cs.resultBox} ${result.passed ? cs.resultPass : cs.resultFail}`}
                  role="status"
                >
                  <strong>{result.passed ? 'Đạt yêu cầu' : 'Chưa đạt'}</strong>
                  <p style={{ margin: '8px 0 0' }}>
                    Điểm: {result.scorePercent}% ({result.correctCount}/{result.totalQuestions} câu đúng)
                  </p>
                  <p style={{ margin: '8px 0 0' }}>{result.message}</p>
                  {result.passed && (
                    <div style={{ marginTop: 14 }}>
                      <Link className={styles.btnPrimary} style={{ display: 'inline-block' }} to={`/learning/course/${courseId}`}>
                        Tiếp tục khóa học
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
