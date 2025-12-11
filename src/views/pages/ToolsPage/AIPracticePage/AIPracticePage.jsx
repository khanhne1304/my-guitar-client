import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../../components/homeItem/Header/Header";
import styles from "./AIPracticePage.module.css";
import { aiPracticeService } from "../../../../services/aiPracticeService";
import AudioSelector from "./AudioSelector";

const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
];
const MAX_SIZE_MB = 200; // giới hạn kích thước file (MB)

const LEVEL_LABELS = {
  0: "Người mới",
  1: "Trung cấp",
  2: "Nâng cao",
};

const REGRESSION_LABELS = {
  pitch_accuracy: "Độ chính xác cao độ",
  timing_accuracy: "Độ chính xác nhịp",
  timing_stability: "Độ ổn định nhịp",
  tempo_deviation_percent: "Độ lệch tempo",
  chord_cleanliness_score: "Độ sạch hợp âm",
  overall_score: "Điểm tổng thể",
};

const REGRESSION_DESCRIPTIONS = {
  pitch_accuracy: "Đánh giá mức độ chính xác về cao độ của các nốt nhạc được chơi",
  timing_accuracy: "Đánh giá mức độ chính xác về thời điểm đánh các nốt nhạc",
  timing_stability: "Đánh giá độ nhất quán về nhịp điệu trong suốt bài tập",
  tempo_deviation_percent: "Đo lường mức độ biến thiên của tempo (phần trăm)",
  chord_cleanliness_score: "Đánh giá chất lượng hợp âm (không buzz, đủ dây, không nhiễu)",
  overall_score: "Điểm tổng hợp từ tất cả các tiêu chí",
};

const REGRESSION_MAX_SCORES = {
  pitch_accuracy: 100,
  timing_accuracy: 100,
  timing_stability: 100,
  tempo_deviation_percent: 15, // Phần trăm, không phải điểm
  chord_cleanliness_score: 100,
  overall_score: 100,
};

// Hàm lấy màu dựa trên điểm số
const getScoreColor = (key, value) => {
  if (key === "tempo_deviation_percent") {
    // Với tempo deviation, giá trị càng thấp càng tốt
    if (value <= 3) return "#4caf50"; // Xanh lá - rất tốt
    if (value <= 7) return "#ff9800"; // Cam - trung bình
    return "#f44336"; // Đỏ - cần cải thiện
  }
  
  // Với các điểm số khác, giá trị càng cao càng tốt
  if (value >= 80) return "#4caf50"; // Xanh lá - tốt
  if (value >= 60) return "#ff9800"; // Cam - trung bình
  return "#f44336"; // Đỏ - cần cải thiện
};

// Hàm tính phần trăm cho progress bar
const getScorePercentage = (key, value) => {
  const max = REGRESSION_MAX_SCORES[key] || 100;
  if (key === "tempo_deviation_percent") {
    // Với tempo deviation, đảo ngược: giá trị thấp = phần trăm cao
    return Math.max(0, Math.min(100, ((max - value) / max) * 100));
  }
  return Math.max(0, Math.min(100, (value / max) * 100));
};

const formatNumber = (value, digits = 1) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  return Number(value).toFixed(digits);
};

export default function AIPracticePage() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAudioSelector, setShowAudioSelector] = useState(false);
  const [selectedAudioFromList, setSelectedAudioFromList] = useState(null);

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

  const fileInfo = useMemo(() => {
    if (!file) return null;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return { name: file.name, sizeMB, type: file.type };
  }, [file]);

  const regressionEntries = useMemo(() => {
    if (!analysis?.scores?.regression) return [];
    return Object.keys(REGRESSION_LABELS)
      .map((key) => [key, analysis.scores.regression[key]])
      .filter(([, value]) => value !== undefined && value !== null);
  }, [analysis]);

  const overallScore = analysis?.scores?.regression?.overall_score ?? null;
  const levelClass = analysis?.scores?.classification?.level_class;
  const levelLabel =
    levelClass === null || levelClass === undefined
      ? "Chưa xác định"
      : LEVEL_LABELS[levelClass] || `Level ${levelClass}`;
  const classificationProbabilities = analysis?.scores?.classification?.probabilities ?? null;

  const onSelectFile = (incoming) => {
    setError("");
    setAnalysis(null);
    setProgress(0);

    if (!incoming) return;
    const isAllowed = ALLOWED_TYPES.includes(incoming.type);
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
      setAnalysis(null);
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

  const handleAnalyze = async () => {
    if (!file || isAnalyzing) return;
    setError("");
    setIsAnalyzing(true);
    setProgress(5);
    setAnalysis(null);
    setIsSaved(false);

    try {
      setProgress(20);
      // Chỉ phân tích, không upload
      const response = await aiPracticeService.analyzeAudioClip({
        file,
      });

      // Xử lý response từ backend (có thể là response.data hoặc response trực tiếp)
      const result = response?.data || response;
      
      if (!result?.scores) {
        throw new Error("Máy chủ không trả về kết quả phân tích.");
      }

      // Đảm bảo có đầy đủ regression scores và classification
      if (!result.scores.regression) {
        throw new Error("Thiếu dữ liệu đánh giá từ mô hình regression.");
      }
      
      if (result.scores.classification === undefined) {
        throw new Error("Thiếu dữ liệu phân loại từ mô hình classification.");
      }

      setProgress(90);
      setAnalysis(result);
      setProgress(100);
    } catch (err) {
      setError(err?.message || "Không thể phân tích âm thanh.");
      setProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = async () => {
    if (!file || !analysis || isSaving || isSaved) return;
    setError("");
    setIsSaving(true);

    try {
      // Upload và lưu kết quả
      const response = await aiPracticeService.uploadAudioClip({
        file,
        lessonId: "ai-practice-demo",
        lessonTitle: "AI Practice Demo",
        level: "intermediate",
      });

      const result = response?.data || response;
      
      if (result?.saved) {
        setIsSaved(true);
        // Cập nhật analysis với thông tin đã lưu
        setAnalysis({
          ...analysis,
          saved: result.saved,
        });
      } else {
        throw new Error("Không thể lưu kết quả.");
      }
    } catch (err) {
      setError(err?.message || "Không thể lưu kết quả.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setError("");
    setFile(null);
    setAnalysis(null);
    setProgress(0);
    setIsAnalyzing(false);
    setIsSaving(false);
    setIsSaved(false);
    setSelectedAudioFromList(null);
    if (isRecording) {
      stopRecording();
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSelectAudioFromList = async (audio) => {
    try {
      setError("");
      setAnalysis(null);
      setProgress(0);
      setSelectedAudioFromList(audio);

      // Tải file từ Cloudinary URL
      const response = await fetch(audio.cloudinaryUrl);
      const blob = await response.blob();
      const audioFile = new File([blob], audio.originalFilename || 'audio.webm', {
        type: audio.metadata?.mimetype || 'audio/webm',
      });

      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setFile(audioFile);
      setShowAudioSelector(false);
    } catch (err) {
      setError("Không thể tải file audio từ server.");
      console.error(err);
    }
  };

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Luyện tập với AI</h1>
          <p className={styles.subtitle}>
            Thu âm hoặc tải lên file âm thanh luyện tập. Hệ thống sẽ phân tích kỹ thuật, hợp
            âm và đưa ra đánh giá trình độ. (Giao diện demo – AI sẽ được tích hợp sau)
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
              <button
                className={styles.secondaryBtn}
                type="button"
                onClick={() => setShowAudioSelector(true)}
                disabled={isAnalyzing}
              >
                Chọn từ danh sách đã upload
              </button>
              <span className={styles.recordingHint}>
                {isRecording
                  ? `Đang thu: ${new Date(recordingTime * 1000).toISOString().substr(14, 5)}`
                  : selectedAudioFromList
                  ? `Đã chọn: ${selectedAudioFromList.originalFilename}`
                  : "Thu trực tiếp hoặc chọn từ danh sách"}
              </span>
            </div>

            {audioUrl && (
              <div className={styles.preview}>
                <audio className={styles.audio} src={audioUrl} controls preload="metadata" />
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={`${styles.primaryBtn} ${!file || isAnalyzing ? styles.disabled : ""}`}
                disabled={!file || isAnalyzing}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? "Đang phân tích..." : "Phân tích âm thanh"}
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
              {/* Nút lưu kết quả */}
              {!isSaved && (
                <div className={styles.saveResultBar}>
                  <div className={styles.saveResultInfo}>
                    <span>Kết quả phân tích chưa được lưu. Bạn có muốn lưu lại không?</span>
                  </div>
                  <button
                    className={styles.saveBtn}
                    onClick={handleSaveResult}
                    disabled={isSaving}
                  >
                    {isSaving ? "Đang lưu..." : "Lưu kết quả"}
                  </button>
                </div>
              )}
              {isSaved && (
                <div className={styles.savedIndicator}>
                  <span>✓ Đã lưu kết quả vào lịch sử</span>
                </div>
              )}
              <div className={styles.grid}>
                {/* Card tổng quan */}
                <div className={styles.card}>
                  <h3>Đánh giá tổng quan</h3>
                  <div className={styles.scoreRow}>
                    <div 
                      className={styles.scoreBadge}
                      style={{ 
                        backgroundColor: getScoreColor("overall_score", overallScore ?? 0) + "20",
                        color: getScoreColor("overall_score", overallScore ?? 0),
                        borderColor: getScoreColor("overall_score", overallScore ?? 0)
                      }}
                    >
                      {formatNumber(overallScore ?? 0, 0)}
                    </div>
                    <div>
                      <div 
                        className={styles.level}
                        style={{ color: getScoreColor("overall_score", overallScore ?? 0) }}
                      >
                        {levelLabel}
                      </div>
                      <div className={styles.note}>
                        File: {analysis.file?.originalname || analysis.metadata?.originalFilename || "Không xác định"}
                      </div>
                      <div className={styles.note}>
                        Kích thước: {analysis.file?.size ? `${(analysis.file.size / (1024 * 1024)).toFixed(1)} MB` : "--"}
                      </div>
                    </div>
                  </div>
                  {classificationProbabilities && (
                    <div className={styles.tags} style={{ marginTop: 12 }}>
                      {classificationProbabilities.map((prob, idx) => (
                        <span 
                          key={idx} 
                          className={styles.tag}
                          style={{
                            backgroundColor: idx === levelClass ? getScoreColor("overall_score", overallScore ?? 0) + "20" : "#f5f5f5",
                            color: idx === levelClass ? getScoreColor("overall_score", overallScore ?? 0) : "#666"
                          }}
                        >
                          {LEVEL_LABELS[idx] || `Level ${idx}`} • {(prob * 100).toFixed(1)}%
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card chi tiết các tiêu chí */}
                <div className={styles.card}>
                  <h3>Chi tiết đánh giá</h3>
                  <div className={styles.scoreDetails}>
                    {regressionEntries
                      .filter(([key]) => key !== "overall_score") // Tách overall_score ra card riêng
                      .map(([key, value]) => {
                        const percentage = getScorePercentage(key, value);
                        const color = getScoreColor(key, value);
                        const isTempoDeviation = key === "tempo_deviation_percent";
                        
                        return (
                          <div key={key} className={styles.scoreItem}>
                            <div className={styles.scoreHeader}>
                              <div className={styles.scoreTitle}>
                                <strong>{REGRESSION_LABELS[key] || key}</strong>
                                <span className={styles.scoreValue} style={{ color }}>
                                  {isTempoDeviation 
                                    ? `${formatNumber(value, 2)}%`
                                    : `${formatNumber(value, 1)}/${REGRESSION_MAX_SCORES[key] ?? 100}`
                                  }
                                </span>
                              </div>
                              <div className={styles.scoreDescription}>
                                {REGRESSION_DESCRIPTIONS[key] || ""}
                              </div>
                            </div>
                            <div className={styles.progressBarContainer}>
                              <div 
                                className={styles.progressBarFill}
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: color
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Card giải thích */}
                <div className={styles.card}>
                  <h3>Giải thích điểm số</h3>
                  <div className={styles.explanation}>
                    <div className={styles.explanationItem}>
                      <span className={styles.explanationDot} style={{ backgroundColor: "#4caf50" }} />
                      <span><strong>Tốt (80-100 điểm):</strong> Kỹ thuật tốt, cần duy trì</span>
                    </div>
                    <div className={styles.explanationItem}>
                      <span className={styles.explanationDot} style={{ backgroundColor: "#ff9800" }} />
                      <span><strong>Trung bình (60-79 điểm):</strong> Đạt cơ bản, cần luyện tập thêm</span>
                    </div>
                    <div className={styles.explanationItem}>
                      <span className={styles.explanationDot} style={{ backgroundColor: "#f44336" }} />
                      <span><strong>Cần cải thiện (&lt;60 điểm):</strong> Cần luyện tập nhiều hơn</span>
                    </div>
                    <div className={styles.explanationNote}>
                      <strong>Lưu ý:</strong> Độ lệch tempo được đánh giá ngược lại (giá trị thấp = tốt)
                    </div>
                  </div>
                </div>

              </div>
            </section>
          )}
        </div>
      </main>

      {showAudioSelector && (
        <AudioSelector
          onSelectAudio={handleSelectAudioFromList}
          selectedAudioId={selectedAudioFromList?.id}
          onClose={() => setShowAudioSelector(false)}
        />
      )}
    </>
  );
}
