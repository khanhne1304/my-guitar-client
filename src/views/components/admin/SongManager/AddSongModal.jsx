import { useState } from "react";
import styles from "./AddSongModal.module.css";
import { songService } from "../../../../services/songService";

export default function AddSongModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    artists: "",
    posterName: "",
    postedAt: "",
    views: 0,
    styleLabel: "",
    tags: "",
    excerpt: "",
    lyrics: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // validate cơ bản
    if (!form.title || !form.lyrics) {
      setError("Tiêu đề và lời bài hát là bắt buộc!");
      return;
    }

    const payload = {
      title: form.title,
      artists: form.artists
        ? form.artists.split(",").map((a) => a.trim())
        : [],
      posterName: form.posterName || undefined,
      postedAt: form.postedAt ? new Date(form.postedAt) : undefined,
      views: Number(form.views) || 0,
      styleLabel: form.styleLabel,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      excerpt: form.excerpt,
      lyrics: form.lyrics,
    };

    try {
      setLoading(true);
      await songService.create(payload);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Lỗi khi thêm bài hát:", err);
      setError(err.message || "Không thể thêm bài hát");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Thêm bài hát mới</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
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
            Nghệ sĩ (cách nhau bởi dấu ,)
            <input
              type="text"
              name="artists"
              value={form.artists}
              onChange={handleChange}
            />
          </label>

          <label>
            Người đăng
            <input
              type="text"
              name="posterName"
              value={form.posterName}
              onChange={handleChange}
            />
          </label>

          <label>
            Ngày đăng
            <input
              type="date"
              name="postedAt"
              value={form.postedAt}
              onChange={handleChange}
            />
          </label>

          <label>
            Thể loại (styleLabel)
            <input
              type="text"
              name="styleLabel"
              value={form.styleLabel}
              onChange={handleChange}
            />
          </label>

          <label>
            Hợp âm sử dụng (cách nhau bởi dấu ,)*
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
            />
          </label>

          <label>
            Tóm tắt* 
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={2}
            />
          </label>

          <label>
            Lời bài hát*
            <textarea
              name="lyrics"
              value={form.lyrics}
              onChange={handleChange}
              rows={6}
              required
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
              disabled={loading}
            >
              {loading ? "Đang thêm..." : "Thêm bài hát"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
