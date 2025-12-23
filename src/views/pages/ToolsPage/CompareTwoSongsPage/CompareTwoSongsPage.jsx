import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../../components/homeItem/Header/Header";
import styles from "./CompareTwoSongsPage.module.css";
import { compareSongService } from "../../../../services/compareSongService";
import { referenceSongService } from "../../../../services/referenceSongService";

const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/vnd.wave",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
];

const MAX_SIZE_MB = 200;

const formatNumber = (value, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  return Number(value).toFixed(digits);
};

export default function CompareTwoSongsPage() {
  const [file1, setFile1] = useState(null);
  const [audioUrl1, setAudioUrl1] = useState("");
  const [error, setError] = useState("");
  const [isDragging1, setIsDragging1] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [comparison, setComparison] = useState(null);
  const [referenceSongs, setReferenceSongs] = useState([]);
  const [selectedReferenceSong, setSelectedReferenceSong] = useState(null);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);

  const inputRef1 = useRef(null);

  useEffect(() => {
    return () => {
      if (audioUrl1) URL.revokeObjectURL(audioUrl1);
    };
  }, [audioUrl1]);

  // Load danh sách bài hát gốc từ admin đã đăng tải
  useEffect(() => {
    const loadReferenceSongs = async () => {
      setIsLoadingSongs(true);
      try {
        console.log("🔄 Đang tải danh sách bài hát gốc...");
        // Sử dụng endpoint public để lấy danh sách bài hát gốc đã được admin đăng tải (isActive = true)
        const response = await referenceSongService.listPublic({ limit: 100 });
        console.log("📦 Response từ API:", response);
        
        if (response?.data?.songs) {
          console.log(`✅ Đã tải ${response.data.songs.length} bài hát gốc`);
          setReferenceSongs(response.data.songs);
        } else if (response?.songs) {
          // Fallback nếu structure khác
          console.log(`✅ Đã tải ${response.songs.length} bài hát gốc (fallback)`);
          setReferenceSongs(response.songs);
        } else {
          console.warn("⚠️ Response không có songs:", response);
          setReferenceSongs([]);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách bài hát gốc:", err);
        console.error("Error details:", {
          message: err?.message,
          response: err?.response,
          data: err?.response?.data,
        });
        setError("Không thể tải danh sách bài hát gốc. Vui lòng thử lại.");
        setReferenceSongs([]);
      } finally {
        setIsLoadingSongs(false);
      }
    };
    loadReferenceSongs();
  }, []);

  const fileInfo1 = useMemo(() => {
    if (!file1) return null;
    const sizeMB = (file1.size / (1024 * 1024)).toFixed(1);
    return { name: file1.name, sizeMB, type: file1.type };
  }, [file1]);


  const validateFile = (file) => {
    if (!file) return null;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isAllowedType = ALLOWED_TYPES.includes(file.type);
    const isAllowedExtension = ['mp3', 'wav', 'webm', 'ogg', 'mp4', 'm4a'].includes(fileExtension);
    const isAllowed = isAllowedType || isAllowedExtension;
    const sizeMB = file.size / (1024 * 1024);
    
    if (!isAllowed) {
      return "Định dạng không hỗ trợ. Vui lòng chọn MP3, WAV, WEBM, OGG hoặc M4A.";
    }
    if (sizeMB > MAX_SIZE_MB) {
      return `File quá lớn (${sizeMB.toFixed(1)} MB). Giới hạn ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const onSelectFile1 = (incoming) => {
    setError("");
    setComparison(null);
    setProgress(0);

    if (!incoming) {
      setFile1(null);
      if (audioUrl1) {
        URL.revokeObjectURL(audioUrl1);
        setAudioUrl1("");
      }
      return;
    }

    const errorMsg = validateFile(incoming);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    if (audioUrl1) URL.revokeObjectURL(audioUrl1);
    const url = URL.createObjectURL(incoming);
    setAudioUrl1(url);
    setFile1(incoming);
  };

  const handleFileInputChange1 = (e) => {
    const f = e.target.files?.[0];
    onSelectFile1(f || null);
  };

  const handleDrop1 = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging1(false);
    const f = e.dataTransfer.files?.[0];
    onSelectFile1(f || null);
  };

  const handleDragOver1 = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging1(true);
  };

  const handleDragLeave1 = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging1(false);
  };

  const handleCompare = async () => {
    if (!file1 || !selectedReferenceSong || isComparing) return;

    setError("");
    setIsComparing(true);
    setProgress(5);
    setComparison(null);

    try {
      setProgress(20);
      const response = await compareSongService.compareTwoSongs({
        file1,
        referenceSongId: selectedReferenceSong._id || selectedReferenceSong.id,
      });

      // Service đã extract data từ response, nên response chính là data object
      const result = response?.data || response;
      
      if (!result || !result.comparison) {
        throw new Error("Máy chủ không trả về kết quả đánh giá.");
      }

      setProgress(90);
      setComparison(result);
      setProgress(100);
    } catch (err) {
      console.error("❌ Lỗi khi so sánh bài hát:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Không thể đánh giá kỹ thuật chơi. Vui lòng thử lại.";
      setError(errorMessage);
      setProgress(0);
    } finally {
      setIsComparing(false);
    }
  };

  const handleReset = () => {
    setError("");
    setFile1(null);
    setComparison(null);
    setProgress(0);
    setIsComparing(false);
    if (audioUrl1) {
      URL.revokeObjectURL(audioUrl1);
      setAudioUrl1("");
    }
    if (inputRef1.current) inputRef1.current.value = "";
  };

  const canCompare = file1 && selectedReferenceSong;

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Đánh giá kỹ thuật chơi</h1>
          <p className={styles.subtitle}>
            Upload bản thu của bạn và chọn bài hát gốc để đánh giá kỹ thuật: lệch thời gian, thiếu/thừa nốt và sai nhịp.
          </p>

          {/* Reference song selector */}
          <div className={styles.referenceSelector}>
            <label className={styles.label}>Chọn bài hát gốc:</label>
            {isLoadingSongs ? (
              <div className={styles.loading}>Đang tải danh sách bài hát...</div>
            ) : referenceSongs.length === 0 ? (
              <div className={styles.loading}>
                {error ? "Không thể tải danh sách bài hát gốc" : "Chưa có bài hát gốc nào được đăng tải"}
              </div>
            ) : (
              <select
                className={styles.select}
                value={selectedReferenceSong?._id || selectedReferenceSong?.id || ""}
                onChange={(e) => {
                  const song = referenceSongs.find(
                    (s) => (s._id || s.id) === e.target.value
                  );
                  setSelectedReferenceSong(song || null);
                }}
                disabled={isComparing}
              >
                <option value="">-- Chọn bài hát gốc --</option>
                {referenceSongs.map((song) => (
                  <option key={song._id || song.id} value={song._id || song.id}>
                    {song.title} {song.artist ? `- ${song.artist}` : ""}
                  </option>
                ))}
              </select>
            )}
            {selectedReferenceSong && (
              <div className={styles.selectedSongInfo}>
                <span>📁 {selectedReferenceSong.title}</span>
                {selectedReferenceSong.artist && (
                  <span>👤 {selectedReferenceSong.artist}</span>
                )}
              </div>
            )}
          </div>

          {/* File upload section */}
          <section
            className={`${styles.uploadCard} ${isDragging1 ? styles.dropActive : ""}`}
            onDrop={handleDrop1}
            onDragOver={handleDragOver1}
            onDragLeave={handleDragLeave1}
          >
            <h3 className={styles.uploadTitle}>Bản thu của bạn</h3>
            <div className={styles.dropzone} onClick={() => inputRef1.current?.click()}>
              <input
                ref={inputRef1}
                type="file"
                accept="audio/*"
                className={styles.hiddenInput}
                onChange={handleFileInputChange1}
              />
              <div className={styles.dropContent}>
                <strong>Chọn hoặc kéo-thả file âm thanh vào đây</strong>
                <span>Hỗ trợ: MP3, WAV, WEBM, OGG, M4A • Tối đa {MAX_SIZE_MB} MB</span>
                {fileInfo1 && (
                  <span className={styles.fileMeta}>
                    Đã chọn: {fileInfo1.name} • {fileInfo1.sizeMB} MB
                  </span>
                )}
              </div>
            </div>
            {audioUrl1 && (
              <div className={styles.preview}>
                <audio className={styles.audio} src={audioUrl1} controls preload="metadata" />
              </div>
            )}
          </section>

          {/* Reference Song Display */}
          <section className={styles.uploadCard}>
            <h3 className={styles.uploadTitle}>Bài hát gốc</h3>
            {selectedReferenceSong ? (
              <div className={styles.referenceInfo}>
                <div className={styles.referenceCard}>
                  <div className={styles.referenceTitle}>{selectedReferenceSong.title}</div>
                  {selectedReferenceSong.artist && (
                    <div className={styles.referenceArtist}>{selectedReferenceSong.artist}</div>
                  )}
                  {selectedReferenceSong.description && (
                    <div className={styles.referenceDesc}>{selectedReferenceSong.description}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.placeholder}>
                Vui lòng chọn bài hát gốc ở trên
              </div>
            )}
          </section>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button
              className={`${styles.primaryBtn} ${!canCompare || isComparing ? styles.disabled : ""}`}
              disabled={!canCompare || isComparing}
              onClick={handleCompare}
            >
              {isComparing ? "Đang đánh giá..." : "Đánh giá"}
            </button>
            <button
              className={styles.ghostBtn}
              onClick={handleReset}
              disabled={isComparing && !comparison}
            >
              Làm mới
            </button>
          </div>

          {isComparing && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressInner} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.progressText}>{progress}%</span>
            </div>
          )}

          {comparison && (
            <section className={styles.results}>
              <div className={styles.grid}>
                {/* Card thông tin đánh giá */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>Kết quả đánh giá</h3>
                    <div className={styles.cardIcon}>📊</div>
                  </div>
                  <div className={styles.comparisonInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>📁 Bản thu của bạn:</span>
                      <span className={styles.infoValue}>
                        {comparison.file1?.originalname || "Không xác định"}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>🎵 Bản gốc:</span>
                      <span className={styles.infoValue}>
                        {comparison.comparison?.referenceSong?.title || "Không xác định"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card lệch thời gian */}
                {comparison.comparison && (
                  <>
                    {comparison.comparison.mean_offset_ms !== undefined && (
                      <div className={styles.card}>
                        <div className={styles.cardHeader}>
                          <h3>Lệch thời gian</h3>
                          <div className={styles.cardIcon}>⏱️</div>
                        </div>
                        <div className={styles.metrics}>
                          <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Trung bình:</span>
                            <span className={styles.metricValue}>
                              {formatNumber(comparison.comparison.mean_offset_ms, 2)} ms
                            </span>
                          </div>
                          {comparison.comparison.std_offset_ms !== undefined && (
                            <div className={styles.metricItem}>
                              <span className={styles.metricLabel}>Độ lệch chuẩn:</span>
                              <span className={styles.metricValue}>
                                {formatNumber(comparison.comparison.std_offset_ms, 2)} ms
                              </span>
                            </div>
                          )}
                          {comparison.comparison.max_offset_ms !== undefined && (
                            <div className={styles.metricItem}>
                              <span className={styles.metricLabel}>Lệch tối đa:</span>
                              <span className={styles.metricValue}>
                                {formatNumber(comparison.comparison.max_offset_ms, 2)} ms
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Card phân tích nốt */}
                    {(comparison.comparison.matched_notes !== undefined ||
                      comparison.comparison.missing_notes_count !== undefined ||
                      comparison.comparison.extra_notes_count !== undefined) && (
                      <div className={styles.card}>
                        <div className={styles.cardHeader}>
                          <h3>Phân tích nốt</h3>
                          <div className={styles.cardIcon}>🎵</div>
                        </div>
                        <div className={styles.metrics}>
                          {comparison.comparison.matched_notes !== undefined && (
                            <div className={styles.metricItem}>
                              <span className={styles.metricLabel}>Số nốt khớp:</span>
                              <span className={styles.metricValue} style={{ color: "#4caf50" }}>
                                {comparison.comparison.matched_notes}
                              </span>
                            </div>
                          )}
                          {(comparison.comparison.missing_notes_count !== undefined || comparison.comparison.missing_notes !== undefined) && (
                            <div className={styles.metricItem}>
                              <span className={styles.metricLabel}>Thiếu nốt:</span>
                              <span className={styles.metricValue} style={{ color: "#f44336" }}>
                                {comparison.comparison.missing_notes_count ?? comparison.comparison.missing_notes}
                              </span>
                            </div>
                          )}
                          {(comparison.comparison.extra_notes_count !== undefined || comparison.comparison.extra_notes !== undefined) && (
                            <div className={styles.metricItem}>
                              <span className={styles.metricLabel}>Thừa nốt:</span>
                              <span className={styles.metricValue} style={{ color: "#ff9800" }}>
                                {comparison.comparison.extra_notes_count ?? comparison.comparison.extra_notes}
                              </span>
                            </div>
                          )}
                          {comparison.comparison.match_rate !== undefined && (
                            <div className={styles.metricItem}>
                              <span className={styles.metricLabel}>Tỷ lệ khớp:</span>
                              <span className={styles.metricValue} style={{ color: "#2196f3" }}>
                                {formatNumber(comparison.comparison.match_rate * 100, 1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Card điểm số tổng thể */}
                    {comparison.comparison.scoring && (
                      <>
                        <div className={styles.card} style={{ gridColumn: "1 / -1" }}>
                          <div className={styles.cardHeader}>
                            <h3>Điểm số và đánh giá</h3>
                            <div className={styles.cardIcon}>⭐</div>
                          </div>
                          <div className={styles.scoringContainer}>
                            <div className={styles.overallScore}>
                              <div className={styles.scoreCircle}>
                                <span className={styles.scoreValue}>
                                  {formatNumber(comparison.comparison.scoring.overall_score, 1)}
                                </span>
                                <span className={styles.scoreMax}>/100</span>
                              </div>
                              <div className={styles.grade}>
                                {comparison.comparison.scoring.grade}
                              </div>
                            </div>
                            {comparison.comparison.scoring.category_scores && (
                              <div className={styles.categoryScores}>
                                {comparison.comparison.scoring.category_scores.accuracy && (
                                  <div className={styles.categoryItem}>
                                    <span className={styles.categoryLabel}>Độ chính xác nốt:</span>
                                    <span className={styles.categoryValue}>
                                      {formatNumber(comparison.comparison.scoring.category_scores.accuracy.score, 1)}/
                                      {comparison.comparison.scoring.category_scores.accuracy.max_score}
                                    </span>
                                    {comparison.comparison.scoring.category_scores.accuracy.match_rate !== undefined && (
                                      <span className={styles.categorySubtext}>
                                        (Khớp: {formatNumber(comparison.comparison.scoring.category_scores.accuracy.match_rate, 1)}%)
                                      </span>
                                    )}
                                  </div>
                                )}
                                {comparison.comparison.scoring.category_scores.timing && (
                                  <div className={styles.categoryItem}>
                                    <span className={styles.categoryLabel}>Độ chính xác thời gian:</span>
                                    <span className={styles.categoryValue}>
                                      {formatNumber(comparison.comparison.scoring.category_scores.timing.score, 1)}/
                                      {comparison.comparison.scoring.category_scores.timing.max_score}
                                    </span>
                                    {comparison.comparison.scoring.category_scores.timing.mean_offset_ms !== undefined && (
                                      <span className={styles.categorySubtext}>
                                        (Lệch TB: {formatNumber(comparison.comparison.scoring.category_scores.timing.mean_offset_ms, 1)}ms)
                                      </span>
                                    )}
                                  </div>
                                )}
                                {comparison.comparison.scoring.category_scores.rhythm && (
                                  <div className={styles.categoryItem}>
                                    <span className={styles.categoryLabel}>Nhịp độ:</span>
                                    <span className={styles.categoryValue}>
                                      {formatNumber(comparison.comparison.scoring.category_scores.rhythm.score, 1)}/
                                      {comparison.comparison.scoring.category_scores.rhythm.max_score}
                                    </span>
                                    {comparison.comparison.scoring.category_scores.rhythm.tempo_ratio !== undefined && (
                                      <span className={styles.categorySubtext}>
                                        (Tempo: {formatNumber(comparison.comparison.scoring.category_scores.rhythm.tempo_ratio, 3)}x)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card gợi ý cải thiện */}
                        {comparison.comparison.scoring.suggestions && 
                         comparison.comparison.scoring.suggestions.length > 0 && (
                          <div className={styles.card} style={{ gridColumn: "1 / -1" }}>
                            <div className={styles.cardHeader}>
                              <h3>Gợi ý cải thiện</h3>
                              <div className={styles.cardIcon}>💡</div>
                            </div>
                            <div className={styles.suggestions}>
                              <ul className={styles.suggestionsList}>
                                {comparison.comparison.scoring.suggestions.map((suggestion, index) => (
                                  <li key={index} className={styles.suggestionItem}>
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

