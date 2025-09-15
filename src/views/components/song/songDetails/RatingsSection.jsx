import StarRating from "../../rating/StarRating";
import styles from "../../../pages/songDetails/SongDetails.module.css";

export default function RatingsSection({ ratings, newRating, setNewRating, onSubmit }) {
  return (
    <div className={styles["song-details__ratings"]}>
      <h2>Đánh giá & Bình luận</h2>
      <div className={styles["song-details__avg"]}>
        ⭐ {ratings.length > 0
            ? (ratings.reduce((a, r) => a + r.stars, 0) / ratings.length).toFixed(1)
            : "Chưa có đánh giá"} ({ratings.length} lượt)
      </div>
      <ul className={styles["song-details__list"]}>
        {ratings.map((r, i) => (
          <li key={i}>
            <strong>{r.user}</strong> <StarRating value={r.stars} max={5} />
            <p>{r.comment}</p>
          </li>
        ))}
      </ul>
      <div className={styles["song-details__form"]}>
        <StarRating
          value={newRating.stars}
          onChange={(v) => setNewRating({ ...newRating, stars: v })}
        />
        <textarea
          placeholder="Viết cảm nhận..."
          value={newRating.comment}
          onChange={(e) => setNewRating({ ...newRating, comment: e.target.value })}
        />
        <button onClick={onSubmit}>Gửi</button>
      </div>
    </div>
  );
}
