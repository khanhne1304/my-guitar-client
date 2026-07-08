import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { getCourseApi } from '../../../services/learningApi';
import ModuleSidebar from '../../components/learning/ModuleSidebar';
import ProgressBar from '../../components/learning/ProgressBar';
import layout from './LearningLayout.module.css';
import cs from './Courses.module.css';

const LEVEL_LABEL = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr('');
      try {
        const res = await getCourseApi(courseId);
        if (!cancelled) {
          setData(res);
          setActiveModuleId((res.modules || [])[0]?.id || null);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Không tải được khóa học');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const course = data?.course;
  const modules = data?.modules || [];
  const activeMod = modules.find((m) => m.id === activeModuleId);

  return (
    <div className={layout.page}>
      <Header />
      <main className={layout.main}>
        {loading ? (
          <p className={layout.muted}>Đang tải…</p>
        ) : err ? (
          <div className={layout.error}>{err}</div>
        ) : (
          <div className={cs.layout}>
            <ModuleSidebar
              courseId={courseId}
              courseTitle={course?.title}
              modules={modules}
              activeModuleId={activeModuleId}
              onSelectModule={setActiveModuleId}
            />
            <div className={layout.card}>
              {course?.thumbnail && (
                <img src={course.thumbnail} alt="" className={cs.thumb} style={{ marginBottom: 16 }} />
              )}
              <div className={cs.metaRow} style={{ marginBottom: 8 }}>
                <span className={cs.badge}>{LEVEL_LABEL[course?.level] || course?.level}</span>
                {course?.creator && (
                  <span className={layout.muted} style={{ fontSize: 13 }}>
                    {course.creator.fullName || course.creator.username}
                  </span>
                )}
              </div>
              <h1 className={layout.title}>{course?.title}</h1>
              {course?.description && <p className={layout.lead}>{course.description}</p>}
              {course?.tags?.length > 0 && (
                <p style={{ margin: '0 0 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {course.tags.map((tag) => (
                    <span key={tag} className={cs.badge}>
                      {tag}
                    </span>
                  ))}
                </p>
              )}
              <ProgressBar
                percent={course?.progressPercent}
                label={`Tiến độ: ${course?.progressPercent ?? 0}% · ${course?.completedLessons ?? 0}/${course?.totalLessons ?? 0} bài`}
              />

              {activeMod ? (
                <section className={layout.moduleSection}>
                  <h2 className={layout.h2}>{activeMod.title}</h2>
                  {activeMod.description && <p className={layout.muted}>{activeMod.description}</p>}

                  <h3 className={cs.sectionTitle}>Bài học</h3>
                  {!activeMod.lessons?.length ? (
                    <p className={layout.muted}>Chưa có bài học.</p>
                  ) : (
                    <ul className={cs.lessonCards}>
                      {activeMod.lessons.map((les) => (
                        <li key={les.id}>
                          <Link
                            to={`/courses/${courseId}/lesson/${les.id}`}
                            className={`${cs.lessonCard} ${les.completed ? cs.lessonCardDone : ''}`}
                          >
                            <span
                              className={`${cs.lessonStatus} ${les.completed ? cs.lessonStatusDone : ''}`}
                              aria-hidden
                            >
                              {les.completed ? '✓' : '○'}
                            </span>
                            <span className={cs.lessonCardBody}>
                              <span className={cs.lessonCardTitle}>{les.title}</span>
                              {les.duration ? (
                                <span className={cs.lessonCardMeta}>{les.duration} phút</span>
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <h3 className={cs.sectionTitle}>Hoàn thành module</h3>
                  <div className={cs.completionPanel}>
                    <ul className={cs.completionList}>
                      <li
                        className={`${cs.completionItem} ${activeMod.practiceLogged ? cs.completionItemDone : ''}`}
                      >
                        <span
                          className={`${cs.completionCheck} ${activeMod.practiceLogged ? cs.completionCheckDone : ''}`}
                          aria-hidden
                        >
                          {activeMod.practiceLogged ? '✓' : '○'}
                        </span>
                        <Link
                          to={`/courses/${courseId}/module/${activeMod.id}/practice`}
                          className={cs.completionLink}
                        >
                          Luyện tập
                        </Link>
                      </li>
                      {activeMod.checkpointQuiz && (
                        <li
                          className={`${cs.completionItem} ${activeMod.checkpointQuiz.passed ? cs.completionItemDone : ''}`}
                        >
                          <span
                            className={`${cs.completionCheck} ${activeMod.checkpointQuiz.passed ? cs.completionCheckDone : ''}`}
                            aria-hidden
                          >
                            {activeMod.checkpointQuiz.passed ? '✓' : '○'}
                          </span>
                          <Link to={`/quiz/${activeMod.checkpointQuiz.id}`} className={cs.completionLink}>
                            {activeMod.checkpointQuiz.title}
                          </Link>
                        </li>
                      )}
                      {activeMod.challengeSong && (
                        <li className={cs.completionItem}>
                          <span className={cs.completionCheck} aria-hidden>
                            🎵
                          </span>
                          <Link
                            to={`/courses/${courseId}/module/${activeMod.id}/challenge`}
                            className={cs.completionLink}
                          >
                            {activeMod.challengeSong.title}
                          </Link>
                        </li>
                      )}
                    </ul>
                    {(activeMod.readyToComplete || activeMod.completed) && (
                      <div className={cs.completionCta}>
                        <Link
                          to={`/courses/${courseId}/module/${activeMod.id}/complete`}
                          className={layout.btnPrimary}
                          style={{ textDecoration: 'none' }}
                        >
                          {activeMod.completed ? 'Xem lại module hoàn thành' : 'Hoàn thành module →'}
                        </Link>
                      </div>
                    )}
                  </div>
                </section>
              ) : (
                <p className={layout.muted} style={{ marginTop: 16 }}>
                  Khóa học chưa có module.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
