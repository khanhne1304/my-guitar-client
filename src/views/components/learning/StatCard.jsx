import layout from '../../pages/courses/LearningLayout.module.css';

export default function StatCard({ value, label, icon }) {
  return (
    <div className={layout.statCard}>
      {icon ? <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div> : null}
      <div className={layout.statValue}>{value}</div>
      <div className={layout.statLabel}>{label}</div>
    </div>
  );
}
