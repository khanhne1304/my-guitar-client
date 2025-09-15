import { useEffect, useMemo, useState } from "react";
import { DEMO_SONGS } from "../views/components/Data/demoSongs";

export function useSongsPageViewModel(items) {
  const [songs, setSongs] = useState(items || []);
  const [loading, setLoading] = useState(!items);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (items) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 200)); // demo latency
        if (alive) setSongs(DEMO_SONGS);
      } catch (e) {
        if (alive) setError("Không tải được danh sách bài hát");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [items]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return songs;
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(k) ||
        (s.artists || []).join(" ").toLowerCase().includes(k) ||
        (s.subtitle || "").toLowerCase().includes(k)
    );
  }, [q, songs]);

  return {
    state: { songs, loading, error, q, filtered },
    actions: { setQ },
  };
}
