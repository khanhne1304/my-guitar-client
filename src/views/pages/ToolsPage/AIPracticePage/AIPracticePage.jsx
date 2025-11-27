import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../../components/homeItem/Header/Header";
import styles from "./AIPracticePage.module.css";

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]; // mp4, webm, ogg, mov
const MAX_SIZE_MB = 500; // giới hạn kích thước file (MB)

export default function AIPracticePage() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const fileInfo = useMemo(() => {
    if (!file) return null;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return { name: file.name, sizeMB, type: file.type };
  }, [file]);

  const onSelectFile = (incoming) => {
    setError("");
    setAnalysis(null);
    setProgress(0);

    if (!incoming) return;
    const isAllowed = ALLOWED_TYPES.includes(incoming.type);
    const sizeMB = incoming.size / (1024 * 1024);
    if (!isAllowed) {
      setError("Định dạng không hỗ trợ. Vui lòng chọn MP4, WEBM, OGG hoặc MOV.");
      return;
    }
    if (sizeMB > MAX_SIZE_MB) {
      setError(`File quá lớn (${sizeMB.toFixed(1)} MB). Giới hạn ${MAX_SIZE_MB} MB.`);
      return;
    }

    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(incoming);
    setVideoUrl(url);
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

  const handleAnalyze = () => {
    if (!file || isAnalyzing) return;
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysis(null);

    // Giả lập tiến trình phân tích
    const totalMs = 2000 + Math.random() * 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(99, Math.floor((elapsed / totalMs) * 100));
      setProgress(pct);
      if (elapsed < totalMs) {
        requestAnimationFrame(tick);
      } else {
        setProgress(100);
        // Kết quả mẫu (mock)
        setAnalysis({
          skillLevel: "Trung cấp",
          score: 72,
          techniques: ["Strumming", "Arpeggio", "Hammer-on", "Pull-off"],
          chords: ["C", "G", "Am", "F", "Dm7"],
          insights: [
            "Giữ nhịp ổn định, đôi lúc hơi nhanh ở cuối câu.",
            "Âm bass rõ nhưng hợp âm đảo chưa đều.",
            "Đổi hợp âm khá mượt, cần luyện thêm ở tốc độ cao.",
          ],
        });
        setIsAnalyzing(false);
      }
    };
    requestAnimationFrame(tick);
  };

  const handleReset = () => {
    setError("");
    setFile(null);
    setAnalysis(null);
    setProgress(0);
    setIsAnalyzing(false);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Luyện tập với AI</h1>
          <p className={styles.subtitle}>
            Tải lên video luyện tập từ máy tính. Hệ thống sẽ phân tích kỹ thuật, hợp âm
            và đưa ra đánh giá trình độ. (Giao diện demo – AI sẽ được tích hợp sau)
          </p>

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
                accept="video/*"
                className={styles.hiddenInput}
                onChange={handleFileInputChange}
              />
              <div className={styles.dropContent}>
                <strong>Chọn hoặc kéo-thả video vào đây</strong>
                <span>Hỗ trợ: MP4, WEBM, OGG, MOV • Tối đa {MAX_SIZE_MB} MB</span>
                {fileInfo && (
                  <span className={styles.fileMeta}>
                    Đã chọn: {fileInfo.name} • {fileInfo.sizeMB} MB
                  </span>
                )}
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {videoUrl && (
              <div className={styles.preview}>
                <video
                  className={styles.video}
                  src={videoUrl}
                  controls
                  preload="metadata"
                />
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={`${styles.primaryBtn} ${!file || isAnalyzing ? styles.disabled : ""}`}
                disabled={!file || isAnalyzing}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? "Đang phân tích..." : "Phân tích video"}
              </button>
              <button
                className={styles.ghostBtn}
                onClick={handleReset}
                disabled={isAnalyzing && !analysis}
              >
                Làm mới
              </button>
            </div>

            {isAnalyzing && (
              <div className={styles.progressWrap}>
                <div className={styles.progressBar}>
                  <div className={styles.progressInner} style={{ width: `${progress}%` }} />
                </div>
                <span className={styles.progressText}>{progress}%</span>
              </div>
            )}
          </section>

          {analysis && (
            <section className={styles.results}>
              <div className={styles.grid}>
                <div className={styles.card}>
                  <h3>Đánh giá tổng quan</h3>
                  <div className={styles.scoreRow}>
                    <div className={styles.scoreBadge}>{analysis.score}</div>
                    <div>
                      <div className={styles.level}>{analysis.skillLevel}</div>
                      <div className={styles.note}>
                        Điểm số được ước lượng dựa trên: độ ổn định nhịp, độ sạch âm, đổi hợp âm, kiểm soát tay.
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <h3>Kỹ thuật phát hiện</h3>
                  <div className={styles.tags}>
                    {analysis.techniques.map((t) => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.card}>
                  <h3>Hợp âm sử dụng</h3>
                  <div className={styles.tags}>
                    {analysis.chords.map((c) => (
                      <span key={c} className={`${styles.tag} ${styles.chord}`}>{c}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.card}>
                  <h3>Gợi ý cải thiện</h3>
                  <ul className={styles.insights}>
                    {analysis.insights.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
