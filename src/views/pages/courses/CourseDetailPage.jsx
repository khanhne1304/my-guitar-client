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

                  <h3 className={layout.h2} style={{ fontSize: 16, marginTop: 16 }}>
                    Bài học
                  </h3>
                  {!activeMod.lessons?.length ? (
                    <p className={layout.muted}>Chưa có bài học.</p>
                  ) : (
                    <ul className={layout.lessonList}>
                      {activeMod.lessons.map((les) => (
                        <li key={les.id}>
                          <Link to={`/courses/${courseId}/lesson/${les.id}`} className={cs.lessonLink}>
                            <span className={les.completed ? layout.checkDone : layout.muted}>
                              {les.completed ? '✓ ' : '○ '}
                            </span>
                            {les.title}
                            {les.duration ? (
                              <span className={layout.muted} style={{ marginLeft: 6, fontSize: 12 }}>
                                · {les.duration} phút
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <h3 className={layout.h2} style={{ fontSize: 16, marginTop: 20 }}>
                    Hoàn thành module
                  </h3>
                  <p className={layout.checklistItem}>
                    <span className={activeMod.practiceLogged ? layout.checkDone : layout.muted}>
                      {activeMod.practiceLogged ? '✓' : '○'}
                    </span>
                    <Link to={`/courses/${courseId}/module/${activeMod.id}/practice`}>Luyện tập</Link>
                  </p>
                  {activeMod.checkpointQuiz && (
                    <p className={layout.checklistItem}>
                      <span className={activeMod.checkpointQuiz.passed ? layout.checkDone : layout.muted}>
                        {activeMod.checkpointQuiz.passed ? '✓' : '○'}
                      </span>
                      <Link to={`/quiz/${activeMod.checkpointQuiz.id}`}>
                        {activeMod.checkpointQuiz.title}
                      </Link>
                    </p>
                  )}
                  {activeMod.challengeSong && (
                    <p className={layout.checklistItem}>
                      <span>🎵</span>
                      <Link to={`/courses/${courseId}/module/${activeMod.id}/challenge`}>
                        {activeMod.challengeSong.title}
                      </Link>
                    </p>
                  )}
                  {(activeMod.readyToComplete || activeMod.completed) && (
                    <Link
                      to={`/courses/${courseId}/module/${activeMod.id}/complete`}
                      className={layout.btnPrimary}
                      style={{ marginTop: 12, display: 'inline-flex', textDecoration: 'none' }}
                    >
                      {activeMod.completed ? 'Xem lại module hoàn thành' : 'Hoàn thành module →'}
                    </Link>
                  )}
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
