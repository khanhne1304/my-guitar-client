import { Link } from "react-router-dom";
import styles from "../../../pages/songDetails/SongDetails.module.css";
export default function RelatedSongs({ relatedSongs, artist }) {
  if (!relatedSongs || relatedSongs.length === 0) return null;

  return (
    <div className={styles["song-details__related"]}>
      <h2 className={styles["song-details__relatedTitle"]}>
        Các bài hát khác của {artist}
      </h2>
      <ul className={styles["song-details__relatedList"]}>
        {relatedSongs.map((rs) => (
          <li key={rs.slug}>
            <Link to={`/songs/${rs.slug}`} className={styles["song-details__relatedLink"]}>
              {rs.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
