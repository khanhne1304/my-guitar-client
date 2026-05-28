import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/homeItem/Header/Header";
import Footer from "../../../components/homeItem/Footer/Footer";
import { searchHopamSongs } from "../../../../services/hopamApi";
import {
  loadPracticeSongs,
  addPracticeSong,
  removePracticeSong,
} from "../../../../utils/aiPracticeSongsStorage";
import AiPracticeAudioSection from "./AiPracticeAudioSection";
import styles from "./CompareTwoSongsPage.module.css";

const DEBOUNCE_MS = 450;

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CompareTwoSongsPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState("");

  const [practiceSongs, setPracticeSongs] = useState(() => loadPracticeSongs());
  const abortRef = useRef(null);

  const runSearch = useCallback(async (q, { manual = false } = {}) => {
    if (!q || q.length < 2) {
      if (manual) setSearchError("Nhập ít nhất 2 ký tự để tìm kiếm");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);
    setSearchError("");
    setHasSearched(true);

    try {
      const data = await searchHopamSongs(q);
      if (controller.signal.aborted) return;
      setResults(data);
    } catch (err) {
      if (controller.signal.aborted) return;
      setResults([]);
      setSearchError(err.message || "Không thể tìm kiếm bài hát");
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return;
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const isInPracticeList = (url) => practiceSongs.some((s) => s.url === url);

  const handleAddFromSearch = (item) => {
    const result = addPracticeSong({
      url: item.url,
      title: item.title,
      artist: item.artist,
      image: item.image,
    });
    if (result.ok) {
      setPracticeSongs(loadPracticeSongs());
      setToast(`Đã thêm "${item.title}" vào danh sách luyện tập`);
    } else if (result.reason === "duplicate") {
      setToast("Bài này đã có trong danh sách luyện tập");
    }
  };

  const handleRemove = (id) => {
    setPracticeSongs(removePracticeSong(id));
  };

  const showEmpty =
    hasSearched && !searching && !searchError && results.length === 0;

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Luyện tập guitar với AI</h1>
          <p className={styles.subtitle}>
            Tìm bài hát gốc từ{" "}
            <Link to="/song-search" className={styles.inlineLink}>
              Hợp âm chuẩn
            </Link>{" "}
            (HopAmChuan) và thêm vào danh sách luyện tập.
          </p>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Tìm bài từ Hợp âm chuẩn</h2>
            <div className={styles.searchRow}>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Nhập tên bài hát, ca sĩ..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runSearch(query.trim(), { manual: true });
                }}
                aria-label="Tìm bài hát"
              />
              <button
                type="button"
                className={styles.searchBtn}
                disabled={searching}
                onClick={() => runSearch(query.trim(), { manual: true })}
              >
                {searching ? "Đang tìm..." : "Tìm kiếm"}
              </button>
            </div>

            {searchError && <p className={styles.error}>{searchError}</p>}

            {searching && (
              <div className={styles.skeletonGrid}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            )}

            {showEmpty && (
              <p className={styles.empty}>Không có kết quả. Thử từ khóa khác.</p>
            )}

            {!searching && results.length > 0 && (
              <ul className={styles.resultList}>
                {results.map((item) => {
                  const added = isInPracticeList(item.url);
                  return (
                    <li key={item.url} className={styles.resultItem}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className={styles.resultThumb}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.resultThumbPlaceholder}>🎵</div>
                      )}
                      <div className={styles.resultBody}>
                        <span className={styles.resultTitle}>{item.title}</span>
                        {item.artist && (
                          <span className={styles.resultArtist}>{item.artist}</span>
                        )}
                      </div>
                      <div className={styles.resultActions}>
                        <Link
                          to="/song-search"
                          state={{ hopamItem: item }}
                          className={styles.linkBtn}
                        >
                          Xem hợp âm
                        </Link>
                        <button
                          type="button"
                          className={`${styles.addBtn} ${added ? styles.addBtnDone : ""}`}
                          disabled={added}
                          onClick={() => handleAddFromSearch(item)}
                        >
                          {added ? "Đã thêm" : "Thêm luyện tập"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              Bài luyện tập đã chọn
              <span className={styles.count}>{practiceSongs.length}</span>
            </h2>

            {practiceSongs.length === 0 ? (
              <p className={styles.empty}>
                Chưa có bài nào. Tìm kiếm ở trên hoặc thêm từ trang{" "}
                <Link to="/song-search" className={styles.inlineLink}>
                  Hợp âm chuẩn
                </Link>
                .
              </p>
            ) : (
              <ul className={styles.songList}>
                {practiceSongs.map((song) => (
                  <li key={song.id} className={styles.songItem}>
                    {song.image ? (
                      <img
                        src={song.image}
                        alt=""
                        className={styles.songThumb}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.songThumbPlaceholder}>🎵</div>
                    )}
                    <div className={styles.songMain}>
                      <span className={styles.songTitle}>{song.title}</span>
                      {song.artist && (
                        <span className={styles.songArtist}>{song.artist}</span>
                      )}
                      <span className={styles.songSource}>Nguồn: Hợp âm chuẩn</span>
                    </div>
                    <div className={styles.songActions}>
                      <Link
                        to="/song-search"
                        state={{
                          hopamItem: {
                            url: song.url,
                            title: song.title,
                            artist: song.artist,
                            image: song.image,
                          },
                        }}
                        className={styles.linkBtn}
                      >
                        Hợp âm
                      </Link>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => handleRemove(song.id)}
                        aria-label={`Xóa ${song.title}`}
                      >
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <AiPracticeAudioSection practiceSongs={practiceSongs} />

          {toast && (
            <div className={styles.toast} role="status">
              {toast}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
