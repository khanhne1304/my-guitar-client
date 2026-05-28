import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getQuizApi, submitQuizApi } from '../../../services/learningApi';
import page from './LearningLayout.module.css';
import cs from './Courses.module.css';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, authChecked } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=/quiz/${quizId}`, { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      setErr('');
      try {
        const res = await getQuizApi(quizId);
        if (!cancelled) setQuiz(res.quiz);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Không tải được bài kiểm tra');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authChecked, isAuthenticated, quizId, navigate]);

  const allAnswered =
    quiz?.questions?.length > 0 && quiz.questions.every((q) => typeof answers[q.key] === 'number');

  const submit = async () => {
    setErr('');
    setSubmitting(true);
    setResult(null);
    try {
      const res = await submitQuizApi(quizId, answers);
      setResult(res);
    } catch (e) {
      setErr(e.message || 'Không nộp được bài kiểm tra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={page.page}>
      <Header />
      <main className={page.main}>
        {loading ? (
          <p className={page.muted}>Đang tải…</p>
        ) : (
          <div className={page.card}>
            <Link to={quiz?.courseId ? `/courses/${quiz.courseId}` : '/courses'} className={page.linkBtn}>
              ← Về khóa học
            </Link>
            {err && <div className={page.error}>{err}</div>}
            {quiz && (
              <>
                <h1 className={page.title} style={{ marginTop: 12 }}>
                  {quiz.title}
                </h1>
                <p className={page.lead}>
                  Trả lời tất cả câu hỏi. Cần đạt tối thiểu {quiz.passingScore}% để đạt.
                </p>
                {(quiz.questions || []).map((q, i) => (
                  <div
                    key={q.key}
                    style={{
                      marginBottom: 12,
                      padding: 12,
                      border: '1px solid #efe4cf',
                      borderRadius: 10,
                      background: '#fff',
                    }}
                  >
                    <p style={{ margin: '0 0 8px', fontWeight: 700 }}>
                      {i + 1}. {q.text}
                    </p>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {(q.options || []).map((opt, idx) => (
                        <label
                          key={idx}
                          className={`${page.option} ${answers[q.key] === idx ? page.optionActive : ''}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                        >
                          <input
                            type="radio"
                            name={`q_${q.key}`}
                            checked={answers[q.key] === idx}
                            onChange={() => setAnswers((a) => ({ ...a, [q.key]: idx }))}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className={page.btnPrimary}
                  disabled={submitting || !allAnswered}
                  onClick={submit}
                >
                  {submitting ? 'Đang nộp…' : 'Nộp bài'}
                </button>
                {result && (
                  <div className={result.passed ? cs.resultPass : cs.resultFail}>
                    {result.passed ? 'Đạt' : 'Chưa đạt'} — {result.score}% ({result.correctCount}/
                    {result.totalQuestions})
                    <div style={{ marginTop: 6, fontWeight: 600 }}>{result.message}</div>
                    {result.passed && result.xpEarned > 0 && (
                      <p style={{ marginTop: 8, fontWeight: 600 }}>+{result.xpEarned} XP</p>
                    )}
                    {result.moduleCompleted && result.courseId && result.moduleId && (
                      <Link
                        to={`/courses/${result.courseId}/module/${result.moduleId}/complete`}
                        className={page.btnPrimary}
                        style={{ marginTop: 12, display: 'inline-flex', textDecoration: 'none' }}
                      >
                        Module hoàn thành →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
