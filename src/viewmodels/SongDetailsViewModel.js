import { useEffect, useState } from "react";
import { DEMO_SONGS } from "../views/components/Data/demoSongs";
import { extractChordsFromLyrics, findRelatedSongs } from "../helpers/songHelpers";

export function useSongDetailsVM(slug) {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState({ stars: 0, comment: "" });

  // Lấy dữ liệu bài hát
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 200)); // demo latency
        if (alive) {
          const data = DEMO_SONGS.find((s) => s.slug === slug) || null;
          setSong(data);
          setRatings(data?.ratings || []);
        }
      } catch {
        if (alive) setError("Không tải được chi tiết bài hát");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  // Action: gửi đánh giá
  const handleSubmitRating = () => {
    if (!newRating.stars || !newRating.comment) return;
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
      relatedSongs: song ? findRelatedSongs(song, DEMO_SONGS) : []
    },
    actions: { setNewRating, handleSubmitRating }
  };
}
