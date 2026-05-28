import cs from '../../pages/courses/Courses.module.css';

export default function CollapsePanel({
  open,
  onToggle,
  title,
  meta,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
}) {
  return (
    <div className={`${cs.collapsePanel} ${className}`.trim()}>
      <button
        type="button"
        className={`${cs.collapseHeader} ${open ? cs.collapseHeaderOpen : ''} ${headerClassName}`.trim()}
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className={`${cs.collapseChevron} ${open ? cs.collapseChevronOpen : ''}`} aria-hidden>
          ▼
        </span>
        <span className={cs.collapseTitle}>{title}</span>
        {meta ? <span className={cs.collapseMeta}>{meta}</span> : null}
      </button>
      {open ? <div className={`${cs.collapseBody} ${bodyClassName}`.trim()}>{children}</div> : null}
    </div>
  );
}
