import { Link } from 'react-router-dom';
import layout from '../../pages/courses/LearningLayout.module.css';
import cs from '../../pages/courses/Courses.module.css';

export default function ModuleSidebar({
  courseId,
  courseTitle,
  modules = [],
  activeModuleId,
  onSelectModule,
}) {
  const activeMod = modules.find((m) => m.id === activeModuleId);

  return (
    <aside className={cs.sidebar}>
      <div className={cs.sidebarTop}>
        <Link to="/learn" className={`${layout.linkBtn} ${cs.sidebarTopBtn}`}>
          ← Bảng điều khiển
        </Link>
        <Link to="/courses" className={`${layout.linkBtn} ${cs.sidebarTopBtn}`}>
          Tất cả khóa học
        </Link>
      </div>
      <h2 className={layout.h2} style={{ marginTop: 16, fontSize: 16 }}>
        {courseTitle}
      </h2>
      <nav className={cs.sidebarNav}>
        {modules.map((mod) => (
          <button
            key={mod.id}
            type="button"
            className={`${layout.moduleNavItem} ${activeModuleId === mod.id ? layout.moduleNavActive : ''}`}
            onClick={() => onSelectModule?.(mod.id)}
          >
            <span style={{ fontWeight: 600 }}>{mod.title}</span>
            {mod.completed ? (
              <span className={`${layout.badge} ${layout.badgeDone}`} style={{ marginLeft: 6 }}>
                ✓
              </span>
            ) : (
              <span className={layout.muted} style={{ display: 'block', fontSize: 12, marginTop: 2 }}>
                {mod.progressPercent}%
              </span>
            )}
          </button>
        ))}
      </nav>
      {activeModuleId && (
        <div className={cs.sidebarActions}>
          <Link
            to={`/courses/${courseId}/module/${activeModuleId}/practice`}
            className={`${cs.sidebarActionBtn} ${cs.sidebarActionBtnPrimary}`}
          >
            Luyện tập
          </Link>
          {activeMod?.checkpointQuiz && (
            <Link
              to={`/quiz/${activeMod.checkpointQuiz.id}`}
              className={cs.sidebarActionBtn}
            >
              Kiểm tra
            </Link>
          )}
          {activeMod?.challengeSong && (
            <Link
              to={`/courses/${courseId}/module/${activeModuleId}/challenge`}
              className={cs.sidebarActionBtn}
            >
              Bài thử thách
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}
