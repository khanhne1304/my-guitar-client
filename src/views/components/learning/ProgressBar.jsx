import layout from '../../pages/courses/LearningLayout.module.css';

export default function ProgressBar({ percent = 0, label }) {
  const p = Math.min(100, Math.max(0, Number(percent) || 0));
  return (
    <div>
      {label ? (
        <p className={layout.muted} style={{ marginBottom: 6, fontSize: 13 }}>
          {label}
        </p>
      ) : null}
      <div className={layout.progressBarWrap}>
        <div className={layout.progressBar} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}
