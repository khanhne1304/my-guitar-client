import { useState, useEffect } from "react";
import styles from "./EditReferenceSongModal.module.css";
import { referenceSongService } from "../../../../services/referenceSongService";

export default function EditReferenceSongModal({ song, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    artist: "",
    tempo: "",
    timeSignature: "4/4",
    key: "",
    difficulty: "intermediate",
    tags: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (song) {
      setForm({
        title: song.title || "",
        description: song.description || "",
        artist: song.artist || "",
        tempo: song.tempo ? String(song.tempo) : "",
        timeSignature: song.timeSignature || "4/4",
        key: song.key || "",
        difficulty: song.difficulty || "intermediate",
        tags: Array.isArray(song.tags) ? song.tags.join(", ") : song.tags || "",
        isActive: song.isActive !== undefined ? song.isActive : true,
      });
    }
  }, [song]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Tiêu đề bài hát là bắt buộc.");
      return;
    }

    try {
      setLoading(true);
      await referenceSongService.update(song._id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        artist: form.artist.trim() || undefined,
        tempo: form.tempo ? Number(form.tempo) : undefined,
        timeSignature: form.timeSignature || "4/4",
        key: form.key.trim() || undefined,
        difficulty: form.difficulty || "intermediate",
        tags: form.tags.trim() || undefined,
        isActive: form.isActive,
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Lỗi khi cập nhật bài hát gốc:", err);
      setError(err?.message || "Không thể cập nhật bài hát gốc");
    } finally {
      setLoading(false);
    }
  };

  if (!song) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Chỉnh sửa bài hát gốc</h2>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.audioInfo}>
          <strong>File audio hiện tại:</strong>
          <div>
            <span>{song.audioFile?.url ? "✓ Đã upload" : "—"}</span>
            {song.audioFile?.duration && (
              <span> • Thời lượng: {Math.floor(song.audioFile.duration / 60)}:{(song.audioFile.duration % 60).toFixed(0).padStart(2, "0")}</span>
            )}
            {song.audioFile?.size && (
              <span> • Kích thước: {(song.audioFile.size / (1024 * 1024)).toFixed(2)} MB</span>
            )}
          </div>
          <small>(Không thể thay đổi file audio. Vui lòng xóa và tạo mới nếu cần.)</small>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
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

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            <span>Hoạt động</span>
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
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


