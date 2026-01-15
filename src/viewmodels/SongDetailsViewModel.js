import { useEffect, useState } from "react";
import { extractChordsFromLyrics, findRelatedSongs } from "../helpers/songHelpers";
import { songService } from "../services/songService";
import { getUser } from "../utils/storage";

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
            // Hợp nhất đánh giá từ API và localStorage (nếu có)
            const localKey = `song_ratings_${slug}`;
            let local = [];
            try {
              const raw = localStorage.getItem(localKey);
              local = raw ? JSON.parse(raw) : [];
              if (!Array.isArray(local)) local = [];
            } catch {
              local = [];
            }
            const apiRatings = Array.isArray(data.ratings) ? data.ratings : [];
            setRatings([...apiRatings, ...local]);
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


  // Action: gửi đánh giá (ưu tiên gọi API; fallback localStorage nếu lỗi)
  const handleSubmitRating = async () => {
    if (!newRating.stars || !newRating.comment) return;
    try {
      if (song?._id) {
        const saved = await songService.addRating(song._id, {
          stars: newRating.stars,
          comment: newRating.comment,
        });
        // API may return {rating} or the rating object directly
        const savedRating = saved?.rating || saved;
        if (savedRating) {
          setRatings([...ratings, savedRating]);
          setNewRating({ stars: 0, comment: "" });
          return;
        }
      }
      // Nếu API không trả về như mong đợi, fallback local
      throw new Error("Unexpected response");
    } catch {
      const currentUser = getUser();
      const displayName =
        currentUser?.fullName ||
        currentUser?.username ||
        currentUser?.email ||
        "Khách";
      const entry = {
        user: displayName,
        stars: newRating.stars,
        comment: newRating.comment,
        createdAt: new Date().toISOString(),
      };
      const next = [...ratings, entry];
      setRatings(next);
      setNewRating({ stars: 0, comment: "" });

      try {
        const localKey = `song_ratings_${slug}`;
        const clientOnly = next.filter((r) => !r._id);
        localStorage.setItem(localKey, JSON.stringify(clientOnly));
      } catch {}
    }
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
