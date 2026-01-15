import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../../components/homeItem/Header/Header";
import Footer from "../../../components/homeItem/Footer/Footer";
import styles from "./CompareSongPage.module.css";
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

export default function CompareSongPage() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [comparison, setComparison] = useState(null);
  const [referenceSongs, setReferenceSongs] = useState([]);
  const [selectedReferenceSong, setSelectedReferenceSong] = useState(null);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // Load danh sách bài hát gốc
  useEffect(() => {
    const loadReferenceSongs = async () => {
      setIsLoadingSongs(true);
      try {
        const response = await referenceSongService.list({ limit: 100, isActive: true });
        if (response?.data?.songs) {
          setReferenceSongs(response.data.songs);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách bài hát gốc:", err);
      } finally {
        setIsLoadingSongs(false);
      }
    };
    loadReferenceSongs();
  }, []);

  const fileInfo = useMemo(() => {
    if (!file) return null;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return { name: file.name, sizeMB, type: file.type };
  }, [file]);

  const onSelectFile = (incoming) => {
    setError("");
    setComparison(null);
    setProgress(0);

    if (!incoming) return;
    // Kiểm tra MIME type và extension
    const fileExtension = incoming.name.split('.').pop()?.toLowerCase();
    const isAllowedType = ALLOWED_TYPES.includes(incoming.type);
    const isAllowedExtension = ['mp3', 'wav', 'webm', 'ogg', 'mp4', 'm4a'].includes(fileExtension);
    const isAllowed = isAllowedType || isAllowedExtension;
    const sizeMB = incoming.size / (1024 * 1024);
    if (!isAllowed) {
      setError("Định dạng không hỗ trợ. Vui lòng chọn MP3, WAV, WEBM, OGG hoặc M4A.");
      return;
    }
    if (sizeMB > MAX_SIZE_MB) {
      setError(`File quá lớn (${sizeMB.toFixed(1)} MB). Giới hạn ${MAX_SIZE_MB} MB.`);
      return;
    }

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(incoming);
    setAudioUrl(url);
    setFile(incoming);
  };

  const handleFileInputChange = (e) => {
    const f = e.target.files?.[0];
    onSelectFile(f || null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    onSelectFile(f || null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const startRecording = async () => {
    if (isRecording) return;
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError("Trình duyệt không hỗ trợ ghi âm trực tiếp.");
      return;
    }
    try {
      setError("");
      setComparison(null);
      setProgress(0);
      recordedChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([blob], `recording-${Date.now()}.webm`, { type: blob.type });
        onSelectFile(audioFile);
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError("Không thể truy cập micro. Vui lòng kiểm tra quyền.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const handleCompare = async () => {
    if (!file || !selectedReferenceSong || isComparing) return;
    setError("");
    setIsComparing(true);
    setProgress(5);
    setComparison(null);

    try {
      setProgress(20);
      const response = await compareSongService.compareAudio({
        file,
        referenceSongId: selectedReferenceSong._id || selectedReferenceSong.id,
      });

      const result = response?.data || response;
      
      if (!result?.comparison) {
        throw new Error("Máy chủ không trả về kết quả so sánh.");
      }

      setProgress(90);
      setComparison(result);
      setProgress(100);
    } catch (err) {
      setError(err?.message || "Không thể so sánh âm thanh.");
      setProgress(0);
    } finally {
      setIsComparing(false);
    }
  };

  const handleReset = () => {
    setError("");
    setFile(null);
    setComparison(null);
    setProgress(0);
    setIsComparing(false);
    if (isRecording) {
      stopRecording();
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>So sánh với bài hát gốc</h1>
          <p className={styles.subtitle}>
            Thu âm hoặc tải lên file âm thanh của bạn để so sánh với bài hát gốc. Hệ thống sẽ phân tích lệch thời gian, thiếu/thừa nốt và sai nhịp.
          </p>

          {/* Chọn bài hát gốc */}
          <div className={styles.referenceSelector}>
            <label className={styles.label}>Chọn bài hát gốc:</label>
            {isLoadingSongs ? (
              <div className={styles.loading}>Đang tải danh sách bài hát...</div>
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

          <section
            className={`${styles.uploadCard} ${isDragging ? styles.dropActive : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className={styles.dropzone} onClick={() => inputRef.current?.click()}>
              <input
                ref={inputRef}
                type="file"
                accept="audio/*"
                className={styles.hiddenInput}
                onChange={handleFileInputChange}
              />
              <div className={styles.dropContent}>
                <strong>Chọn hoặc kéo-thả file âm thanh vào đây</strong>
                <span>Hỗ trợ: MP3, WAV, WEBM, OGG, M4A • Tối đa {MAX_SIZE_MB} MB</span>
                {fileInfo && (
                  <span className={styles.fileMeta}>
                    Đã chọn: {fileInfo.name} • {fileInfo.sizeMB} MB
                  </span>
                )}
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.recordingActions}>
              <button
                className={styles.secondaryBtn}
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? "Dừng thu âm" : "Thu âm bằng micro"}
              </button>
              <span className={styles.recordingHint}>
                {isRecording
                  ? `Đang thu: ${new Date(recordingTime * 1000).toISOString().substr(14, 5)}`
                  : "Thu trực tiếp hoặc tải file lên"}
              </span>
            </div>

            {audioUrl && (
              <div className={styles.preview}>
                <audio className={styles.audio} src={audioUrl} controls preload="metadata" />
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={`${styles.primaryBtn} ${!file || !selectedReferenceSong || isComparing ? styles.disabled : ""}`}
                disabled={!file || !selectedReferenceSong || isComparing}
                onClick={handleCompare}
              >
                {isComparing ? "Đang so sánh..." : "So sánh với bài hát gốc"}
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
          </section>

          {comparison && (
            <section className={styles.results}>
              <div className={styles.grid}>
                {/* Card thông tin so sánh */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>Kết quả so sánh</h3>
                    <div className={styles.cardIcon}>📊</div>
                  </div>
                  <div className={styles.comparisonInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>📁 File của bạn:</span>
                      <span className={styles.infoValue}>
                        {comparison.file?.originalname || "Không xác định"}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>🎵 Bài hát gốc:</span>
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

                    {/* Card so sánh nốt */}
                    {(comparison.comparison.matched_notes !== undefined ||
                      comparison.comparison.missing_notes !== undefined ||
                      comparison.comparison.extra_notes !== undefined) && (
                      <div className={styles.card}>
                        <div className={styles.cardHeader}>
                          <h3>So sánh nốt</h3>
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
                          {comparison.comparison.missing_notes !== undefined && (
                            <div className={styles.metricItem}>
                              <span className={styles.metricLabel}>Thiếu nốt:</span>
                              <span className={styles.metricValue} style={{ color: "#f44336" }}>
                                {comparison.comparison.missing_notes}
                              </span>
                            </div>
                          )}
                          {comparison.comparison.extra_notes !== undefined && (
                            <div className={styles.metricItem}>
                              <span className={styles.metricLabel}>Thừa nốt:</span>
                              <span className={styles.metricValue} style={{ color: "#ff9800" }}>
                                {comparison.comparison.extra_notes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

