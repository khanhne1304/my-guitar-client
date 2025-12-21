import { useState, useRef, useEffect } from "react";
import styles from "./AddReferenceSongModal.module.css";
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

export default function AddReferenceSongModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    artist: "",
    tempo: "",
    timeSignature: "4/4",
    key: "",
    difficulty: "intermediate",
    tags: "",
  });
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFileSelect = (file) => {
    if (!file) {
      setAudioFile(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
      }
      return;
    }

    // Kiểm tra file có kích thước hợp lệ
    if (file.size === 0) {
      setError("File audio rỗng hoặc không hợp lệ. Vui lòng chọn file khác.");
      setAudioFile(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
      }
      return;
    }

    // Kiểm tra MIME type và extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isAllowedType = ALLOWED_TYPES.includes(file.type);
    const isAllowedExtension = ['mp3', 'wav', 'webm', 'ogg', 'mp4', 'm4a'].includes(fileExtension);
    const isAllowed = isAllowedType || isAllowedExtension;
    const sizeMB = file.size / (1024 * 1024);

    if (!isAllowed) {
      setError("Định dạng không hỗ trợ. Vui lòng chọn MP3, WAV, WEBM, OGG hoặc M4A.");
      setAudioFile(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
      }
      return;
    }
    if (sizeMB > MAX_SIZE_MB) {
      setError(`File quá lớn (${sizeMB.toFixed(1)} MB). Giới hạn ${MAX_SIZE_MB} MB.`);
      setAudioFile(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
      }
      return;
    }

    setError("");
    // Revoke old URL trước khi tạo mới
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    // Tạo URL mới và set state
    try {
      const url = URL.createObjectURL(file);
      console.log("File selected:", file.name, "Type:", file.type, "Size:", sizeMB.toFixed(2), "MB");
      console.log("Audio URL created:", url);
      
      setAudioFile(file);
      setAudioUrl(url);
    } catch (err) {
      console.error("Error creating object URL:", err);
      setError("Không thể tạo preview cho file này. Vui lòng thử lại hoặc chọn file khác.");
      setAudioFile(null);
    }
  };

  const handleFileInputChange = (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    handleFileSelect(file || null);
    // Reset input để có thể chọn lại file cùng tên
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file || null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Tiêu đề bài hát là bắt buộc.");
      return;
    }

    if (!audioFile) {
      setError("Vui lòng chọn file audio.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await referenceSongService.create({
        audioFile,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        artist: form.artist.trim() || undefined,
        tempo: form.tempo ? Number(form.tempo) : undefined,
        timeSignature: form.timeSignature || "4/4",
        key: form.key.trim() || undefined,
        difficulty: form.difficulty || "intermediate",
        tags: form.tags.trim() || undefined,
      });
      
      if (result?.success === false) {
        throw new Error(result?.message || "Không thể thêm bài hát gốc");
      }
      
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Lỗi khi thêm bài hát gốc:", err);
      console.error("Error details:", {
        message: err?.message,
        status: err?.status,
        response: err?.response,
        data: err?.data,
      });
      
      // Lấy thông báo lỗi từ nhiều nguồn
      let errorMessage = "Không thể thêm bài hát gốc. Vui lòng thử lại.";
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    // Chỉ đóng modal khi click vào overlay, không phải vào modal content
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Thêm bài hát gốc mới</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* File upload */}
          <label className={styles.fileLabel}>
            File audio * (MP3, WAV, WEBM, OGG, M4A - Tối đa {MAX_SIZE_MB} MB)
            <div
              className={`${styles.dropzone} ${isDragging ? styles.dropActive : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className={styles.hiddenInput}
                onChange={handleFileInputChange}
                onClick={(e) => e.stopPropagation()}
              />
              <div className={styles.dropContent}>
                {audioFile ? (
                  <>
                    <strong>✓ {audioFile.name}</strong>
                    <span>{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    {audioUrl ? (
                      <div className={styles.audioWrapper}>
                        <audio 
                          key={audioUrl} 
                          src={audioUrl} 
                          controls 
                          className={styles.audioPreview}
                          preload="metadata"
                          onLoadStart={() => {
                            console.log("Audio loading started");
                            setError(""); // Clear error when starting to load
                          }}
                          onLoadedMetadata={() => {
                            console.log("Audio metadata loaded successfully");
                            setError(""); // Clear any previous errors
                          }}
                          onError={(e) => {
                            const audioElement = e.target;
                            const error = audioElement.error;
                            let errorMessage = "Không thể tải file audio để preview. ";
                            
                            if (error) {
                              switch (error.code) {
                                case error.MEDIA_ERR_ABORTED:
                                  errorMessage += "Quá trình tải bị hủy.";
                                  break;
                                case error.MEDIA_ERR_NETWORK:
                                  errorMessage += "Lỗi kết nối mạng.";
                                  break;
                                case error.MEDIA_ERR_DECODE:
                                  errorMessage += "File audio bị hỏng hoặc định dạng không được hỗ trợ.";
                                  break;
                                case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                  errorMessage += "Định dạng audio không được trình duyệt hỗ trợ.";
                                  break;
                                default:
                                  errorMessage += "Vui lòng thử lại hoặc chọn file khác.";
                              }
                              console.error("Audio load error:", {
                                code: error.code,
                                message: errorMessage,
                                file: audioFile?.name,
                                type: audioFile?.type,
                                size: audioFile?.size
                              });
                            } else {
                              console.error("Audio load error (no error code):", e);
                            }
                            
                            setError(errorMessage);
                            // Revoke the invalid URL
                            if (audioUrl) {
                              URL.revokeObjectURL(audioUrl);
                              setAudioUrl("");
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <span style={{ color: '#ff9800', fontSize: '12px' }}>
                        Đang tải preview...
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <strong>Chọn hoặc kéo-thả file audio vào đây</strong>
                    <span>Hỗ trợ: MP3, WAV, WEBM, OGG, M4A • Tối đa {MAX_SIZE_MB} MB</span>
                  </>
                )}
              </div>
            </div>
          </label>

          <label>
            Tiêu đề *
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Mô tả
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <label>
            Nghệ sĩ
            <input
              type="text"
              name="artist"
              value={form.artist}
              onChange={handleChange}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.half}>
              Tempo (BPM)
              <input
                type="number"
                name="tempo"
                value={form.tempo}
                onChange={handleChange}
                min="1"
                max="300"
              />
            </label>

            <label className={styles.half}>
              Nhịp (Time Signature)
              <select
                name="timeSignature"
                value={form.timeSignature}
                onChange={handleChange}
              >
                <option value="4/4">4/4</option>
                <option value="3/4">3/4</option>
                <option value="2/4">2/4</option>
                <option value="6/8">6/8</option>
                <option value="12/8">12/8</option>
              </select>
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.half}>
              Tông (Key)
              <input
                type="text"
                name="key"
                value={form.key}
                onChange={handleChange}
                placeholder="C, D, E, F, G, A, B"
              />
            </label>

            <label className={styles.half}>
              Độ khó *
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                required
              >
                <option value="beginner">Người mới</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </label>
          </div>

          <label>
            Tags (cách nhau bởi dấu phẩy)
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="guitar, acoustic, fingerstyle"
            />
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !audioFile}
            >
              {loading ? "Đang tải lên..." : "Thêm bài hát gốc"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

