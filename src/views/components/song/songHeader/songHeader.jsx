import { Link } from "react-router-dom";
import styles from "./SongHeader.module.css";

export default function SongHeader({ q, setQ }) {
  return (
    <div className={styles["songs-header"]}>
      {/* Nút Trang chủ sát lề trái */}
      <Link to="/" className={styles["songs-header__homeBtn"]}>
        Trang chủ
      </Link>

      {/* Nội dung ở giữa */}
      <div className={styles["songs-header__inner"]}>
        <h1 className={styles["songs-header__title"]}>Bài hát & Hợp Âm</h1>

        <form
          className={styles["songs-header__search"]}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên bài hát / nghệ sĩ…"
            className={styles["songs-header__input"]}
          />
          <button
            type="submit"
            className={styles["songs-header__searchBtn"]}
          >
            Tìm kiếm
          </button>
        </form>
      </div>
    </div>
  );
}
