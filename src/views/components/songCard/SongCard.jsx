import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import s from "./SongCard.module.css";

/** Format: "26 tháng 07, 2025 lúc 09:26" */
function formatVNDateTime(d) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${day} tháng ${month}, ${year} lúc ${hh}:${mm}`;
}

/** Render 1 dòng lyric và làm nổi bật các hợp âm trong [ ] */
function LineWithChords({ line }) {
  const parts = [];
  const re = /\[([^\]]+)\]/g;
  let last = 0, m;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) parts.push(line.slice(last, m.index));
    parts.push(
      <span key={parts.length} className={s.songCard__chord}>
        [{m[1]}]
      </span>
    );
    last = re.lastIndex;
  }
  if (last < line.length) parts.push(line.slice(last));
  return <div className={s.songCard__line}>{parts}</div>;
}

LineWithChords.propTypes = { line: PropTypes.string.isRequired };

/** Thẻ tóm tắt 1 bài hát */
export default function SongCard({ song, compact = true }) {
  const {
    title,
    subtitle,
    artists = [],
    slug,
    posterName,
    postedAt,
    views = 0,
    styleLabel,
    tags = [],
    excerpt = "",
  } = song;

  const lines = excerpt.trim().split(/\r?\n/).slice(0, 8);

  return (
    <article className={`${s.songCard} ${compact ? s["songCard--compact"] : ""}`}>
      <header className={s.songCard__header}>
        <h3 className={s.songCard__title}>
          <Link to={`/songs/${slug}`} className={s.songCard__titleLink}>
            {title}{" "}
            {subtitle && <span className={s.songCard__subtitle}>{subtitle}</span>}
            {artists.length > 0 && " - "}
            <span className={s.songCard__artists}>{artists.join(", ")}</span>
          </Link>
        </h3>

        <div className={s.songCard__meta}>
          {posterName && <span className={s.songCard__poster}>{posterName}</span>}
          {posterName && <span className={s.songCard__dot}>•</span>}
          {postedAt && (
            <time className={s.songCard__time}>{formatVNDateTime(postedAt)}</time>
          )}
          <span className={s.songCard__views}>
            {views.toLocaleString()} <span className={s.songCard__eye} aria-hidden>👁</span>
          </span>
        </div>
      </header>

      <section className={s.songCard__excerpt}>
        {lines.map((ln, i) => (
          <LineWithChords key={i} line={ln} />
        ))}
      </section>

      <footer className={s.songCard__footer}>
        <div className={s.songCard__tags}>
          {tags.map((t) => (
            <span key={t} className={s.songCard__tag}>{t}</span>
          ))}
        </div>
        {styleLabel && <button className={s.songCard__styleBtn}>{styleLabel}</button>}
      </footer>
    </article>
  );
}

SongCard.propTypes = {
  compact: PropTypes.bool,
  song: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    artists: PropTypes.arrayOf(PropTypes.string),
    slug: PropTypes.string.isRequired,
    posterName: PropTypes.string,
    postedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    views: PropTypes.number,
    styleLabel: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    excerpt: PropTypes.string,
  }).isRequired,
};
