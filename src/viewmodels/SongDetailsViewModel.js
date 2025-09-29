import { useEffect, useState } from "react";
import { extractChordsFromLyrics, findRelatedSongs } from "../helpers/songHelpers";
import { songService } from "../services/songService";

export function useSongDetailsVM(slug) {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState({ stars: 0, comment: "" });

  // Lấy dữ liệu bài hát theo slug
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await songService.getBySlug(slug);
        if (alive) {
          if (!data?.isActive) {
            setError("Bài hát đã bị ẩn");
            setSong(null);
          } else {
            console.log("🎵 Song data từ API:", data);
            setSong(data);
            setRatings(data.ratings || []);
          }
        }
      } catch (e) {
        if (alive) setError(e.message || "Không tải được chi tiết bài hát");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);


  // Action: gửi đánh giá (chưa có API riêng thì update tạm trong state)
  const handleSubmitRating = async () => {
    if (!newRating.stars || !newRating.comment) return;
    // Nếu có API rating riêng: await songService.addRating(song._id, newRating);
    setRatings([...ratings, { user: "Khách", ...newRating }]);
    setNewRating({ stars: 0, comment: "" });
  };

  return {
    state: {
      song,
      loading,
      error,
      ratings,
      newRating,
      uniqueChords: song ? extractChordsFromLyrics(song.lyrics) : [],
      relatedSongs: song ? findRelatedSongs(song, []) : [], // sẽ fetch từ API sau nếu muốn
    },
    actions: { setNewRating, handleSubmitRating },
  };
}
