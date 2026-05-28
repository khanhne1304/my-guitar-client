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
  return (
    <aside className={cs.sidebar}>
      <Link to="/learn" className={layout.linkBtn}>
        ← Bảng điều khiển
      </Link>
      <Link to="/courses" className={layout.linkBtn} style={{ marginTop: 8 }}>
        Tất cả khóa học
      </Link>
      <h2 className={layout.h2} style={{ marginTop: 16, fontSize: 16 }}>
        {courseTitle}
      </h2>
      <nav style={{ marginTop: 12 }}>
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
        <div style={{ marginTop: 16 }}>
          <Link
            to={`/courses/${courseId}/module/${activeModuleId}/practice`}
            className={layout.linkBtn}
            style={{ width: '100%', marginBottom: 8 }}
          >
            Luyện tập
          </Link>
          {modules.find((m) => m.id === activeModuleId)?.checkpointQuiz && (
            <Link
              to={`/quiz/${modules.find((m) => m.id === activeModuleId).checkpointQuiz.id}`}
              className={layout.linkBtn}
              style={{ width: '100%', marginBottom: 8 }}
            >
              Kiểm tra
            </Link>
          )}
          {modules.find((m) => m.id === activeModuleId)?.challengeSong && (
            <Link
              to={`/courses/${courseId}/module/${activeModuleId}/challenge`}
              className={layout.linkBtn}
              style={{ width: '100%' }}
            >
              Bài thử thách
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}
