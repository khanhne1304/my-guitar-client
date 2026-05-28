import { Link } from "react-router-dom";
import styles from "../../../pages/songDetails/SongDetails.module.css";

export default function SongHeader({ song }) {
  return (
    <div className={styles["song-details__header"]}>
      <Link to="/song-search" className={styles["song-details__home"]}>Quay về</Link>
      <div className={styles["song-details__titleMeta"]}>
        <h1 className={styles["song-details__title"]}>
          {song.title} – {song.artists.join(", ")}
        </h1>
        <div className={styles["song-details__meta"]}>
          Đăng bởi {song.posterName} • {new Date(song.postedAt).toLocaleString("vi-VN")} • 👁 {song.views}
        </div>
      </div>
    </div>
  );
}
