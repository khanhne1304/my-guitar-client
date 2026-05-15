import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaDrum } from 'react-icons/fa';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { searchHopamSongs, fetchHopamSong } from '../../../services/hopamApi';
import { addPracticeSong, loadPracticeSongs } from '../../../utils/aiPracticeSongsStorage';
import { transposeSongData } from '../../../utils/transposeChord';
import ChordTooltip from '../../components/song/songDetails/ChordTooltip';
import SongAudioComparePanel from '../../components/songSearch/SongAudioComparePanel';
import styles from './SongSearchPage.module.css';

const DEBOUNCE_MS = 450;

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SearchSkeleton() {
  return (
    <div className={styles.grid}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  );
}

function ChordChip({ chord }) {
  return (
    <ChordTooltip chordText={`[${chord}]`} trigger="click">
      <span className={styles.chordInline}>[{chord}]</span>
    </ChordTooltip>
  );
}

function ChordLyricViewer({ song }) {
  return (
    <div className={styles.lyricBlock}>
      {(song.lines || []).map((line, idx) => {
        if (line.kind === 'empty') {
          return <div key={idx} className={styles.lyricLineWrap} aria-hidden />;
        }
        if (line.kind === 'section') {
          return (
            <p key={idx} className={styles.lyricSection}>
              {line.section}
            </p>
          );
        }
        return (
          <div key={idx} className={styles.lyricLineWrap}>
            <div className={styles.lyricLine}>
              {(line.segments || []).map((seg, i) =>
                seg.type === 'chord' ? (
                  <ChordChip key={i} chord={seg.text} />
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
              {!line.segments?.length && line.lyricLine}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SongSearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [selected, setSelected] = useState(null);
  const [song, setSong] = useState(null);
  const [loadingSong, setLoadingSong] = useState(false);
  const [songError, setSongError] = useState('');
  const [transpose, setTranspose] = useState(0);
  const [tempo, setTempo] = useState(90);
  const [practiceToast, setPracticeToast] = useState('');

  const abortRef = useRef(null);
  const hopamHandledRef = useRef(null);
  const [aiPracticeUrls, setAiPracticeUrls] = useState(
    () => new Set(loadPracticeSongs().map((s) => s.url)),
  );

  const runSearch = useCallback(async (q, { manual = false } = {}) => {
    if (!q || q.length < 2) {
      if (manual) setSearchError('Nhập ít nhất 2 ký tự để tìm kiếm');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);
    setSearchError('');
    setHasSearched(true);

    try {
      const data = await searchHopamSongs(q);
      if (controller.signal.aborted) return;
      setResults(data);
    } catch (err) {
      if (controller.signal.aborted) return;
      setResults([]);
      setSearchError(err.message || 'Không thể tìm kiếm bài hát');
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return;
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  const displayedSong = useMemo(
    () => (song ? transposeSongData(song, transpose) : null),
    [song, transpose],
  );

  const handleSelect = useCallback(async (item) => {
    setSelected(item);
    setSong(null);
    setSongError('');
    setTranspose(0);
    setLoadingSong(true);

    try {
      const data = await fetchHopamSong(item.url);
      setSong(data);
      setTempo(typeof data?.tempo === 'number' ? data.tempo : 90);
    } catch (err) {
      setSongError(err.message || 'Không thể tải hợp âm bài hát');
    } finally {
      setLoadingSong(false);
    }
  }, []);

  useEffect(() => {
    const item = location.state?.hopamItem;
    if (!item?.url || hopamHandledRef.current === item.url) return;
    hopamHandledRef.current = item.url;
    handleSelect(item);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, handleSelect, navigate]);

  useEffect(() => {
    if (!practiceToast) return;
    const t = setTimeout(() => setPracticeToast(''), 2800);
    return () => clearTimeout(t);
  }, [practiceToast]);

  const handleAddToAiPractice = () => {
    if (!selected) return;
    const result = addPracticeSong({
      url: selected.url,
      title: selected.title,
      artist: selected.artist,
      image: selected.image,
    });
    if (result.ok) {
      setAiPracticeUrls((prev) => new Set([...prev, selected.url]));
      setPracticeToast(`Đã thêm "${selected.title}" vào luyện tập AI`);
    } else {
      setPracticeToast('Bài này đã có trong danh sách luyện tập AI');
    }
  };

  const isInAiPractice = selected && aiPracticeUrls.has(selected.url);

  const handleBack = () => {
    setSelected(null);
    setSong(null);
    setSongError('');
    setTranspose(0);
    setTempo(90);
  };

  const showEmpty =
    hasSearched && !searching && !searchError && results.length === 0;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.hero}>
            <h1 className={styles.heroTitle}>Tìm hợp âm chuẩn</h1>
            <p className={styles.heroSub}>
              Tìm bài hát trên HopAmChuan và xem hợp âm ngay trên My Guitar
            </p>
          </header>

          {!selected ? (
            <>
              <div className={styles.searchCard}>
                <div className={styles.searchRow}>
                  <input
                    type="search"
                    className={styles.searchInput}
                    placeholder="Nhập tên bài hát, ca sĩ..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') runSearch(query.trim(), { manual: true });
                    }}
                    aria-label="Tìm bài hát"
                  />
                  <button
                    type="button"
                    className={styles.searchBtn}
                    disabled={searching}
                    onClick={() => runSearch(query.trim(), { manual: true })}
                  >
                    {searching ? <span className={styles.spinner} /> : null}
                    {searching ? 'Đang tìm...' : 'Tìm kiếm'}
                  </button>
                </div>
              </div>

              {searchError ? (
                <div className={styles.errorState} role="alert">
                  <div className={styles.emptyIcon}>⚠️</div>
                  <p className={styles.errorTitle}>Có lỗi xảy ra</p>
                  <p className={styles.errorText}>{searchError}</p>
                </div>
              ) : null}

              {searching ? <SearchSkeleton /> : null}

              {showEmpty ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🎸</div>
                  <p className={styles.emptyTitle}>Không có kết quả</p>
                  <p className={styles.emptyText}>
                    Thử từ khóa khác hoặc tên ca sĩ kèm theo tên bài
                  </p>
                </div>
              ) : null}

              {!searching && results.length > 0 ? (
                <div className={styles.grid}>
                  {results.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      className={styles.resultCard}
                      onClick={() => handleSelect(item)}
                    >
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
                        <p className={styles.resultTitle}>{item.title}</p>
                        <p className={styles.resultArtist}>{item.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <button type="button" className={styles.backBtn} onClick={handleBack}>
                ← Quay lại kết quả
              </button>

              {loadingSong ? (
                <div className={styles.songPanel}>
                  <SearchSkeleton />
                </div>
              ) : null}

              {songError ? (
                <div className={styles.errorState} role="alert">
                  <p className={styles.errorTitle}>Không tải được hợp âm</p>
                  <p className={styles.errorText}>{songError}</p>
                </div>
              ) : null}

              {displayedSong && !loadingSong ? (
                <article className={styles.songPanel}>
                  <header className={styles.songHeader}>
                    <div>
                      <h2 className={styles.songTitle}>{displayedSong.title}</h2>
                      <p className={styles.songArtist}>{displayedSong.artist}</p>
                    </div>
                    <div className={styles.metaRow}>
                      {displayedSong.key ? (
                        <span className={styles.badge}>Tone: {displayedSong.key}</span>
                      ) : null}
                      {typeof displayedSong.capo === 'number' ? (
                        <span className={styles.badge}>Capo: {displayedSong.capo}</span>
                      ) : null}
                    </div>
                  </header>

                  <div className={styles.aiPracticeBar}>
                    <p className={styles.aiPracticeHint}>
                      Dùng bài này làm bài gốc cho luyện tập guitar với AI
                    </p>
                    <div className={styles.aiPracticeActions}>
                      <button
                        type="button"
                        className={styles.aiPracticeAddBtn}
                        disabled={isInAiPractice}
                        onClick={handleAddToAiPractice}
                      >
                        {isInAiPractice ? 'Đã thêm luyện tập AI' : 'Thêm luyện tập AI'}
                      </button>
                      <Link to="/tools/ai-guitar-practice" className={styles.aiPracticeLink}>
                        Xem danh sách luyện tập
                      </Link>
                    </div>
                  </div>

                  <div className={styles.rhythmBar}>
                    <div className={styles.rhythmInfo}>
                      <FaDrum className={styles.rhythmIcon} aria-hidden />
                      <div>
                        <span className={styles.rhythmLabel}>Nhịp / điệu</span>
                        <span className={styles.rhythmValue}>
                          {displayedSong.rhythm || 'Chưa có thông tin điệu'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.tempoControl}>
                      <label className={styles.controlLabel} htmlFor="song-tempo">
                        Tempo (BPM)
                      </label>
                      <input
                        id="song-tempo"
                        type="number"
                        min={40}
                        max={240}
                        className={styles.tempoInput}
                        value={tempo}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (!Number.isNaN(n)) {
                            setTempo(Math.min(240, Math.max(40, n)));
                          }
                        }}
                      />
                      <Link to="/tools/metronome" className={styles.metronomeLink}>
                        Máy đếm nhịp
                      </Link>
                    </div>
                  </div>

                  <div className={styles.controls}>
                    <span className={styles.controlLabel}>Transpose</span>
                    <div className={styles.transposeBtns}>
                      <button
                        type="button"
                        className={styles.transposeBtn}
                        onClick={() => setTranspose((t) => t - 1)}
                        aria-label="Hạ tone"
                      >
                        −
                      </button>
                      <span className={styles.badge}>
                        {transpose > 0 ? `+${transpose}` : transpose}
                      </span>
                      <button
                        type="button"
                        className={styles.transposeBtn}
                        onClick={() => setTranspose((t) => t + 1)}
                        aria-label="Tăng tone"
                      >
                        +
                      </button>
                      {transpose !== 0 ? (
                        <button
                          type="button"
                          className={styles.transposeBtn}
                          onClick={() => setTranspose(0)}
                          title="Reset transpose"
                        >
                          ↺
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <ChordLyricViewer song={displayedSong} />

                  <SongAudioComparePanel
                    title={displayedSong.title}
                    artist={displayedSong.artist}
                  />
                </article>
              ) : null}
            </>
          )}
        </div>
      </main>
      <Footer />
      {practiceToast ? (
        <div className={styles.practiceToast} role="status">
          {practiceToast}
        </div>
      ) : null}
    </div>
  );
}
