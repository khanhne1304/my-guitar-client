import { useState } from "react";
import styles from "./AddSongModal.module.css";
import { songService } from "../../../../services/songService";

export default function AddSongModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
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
    if (!form.title.trim()) {
      setError("Thiếu tên bài hát");
      setTimeout(() => {
        document.querySelector('input[name="title"]')?.focus();
      }, 100);
      return;
    }
    if (!form.tags.trim()) {
      setError("Vui lòng điền vào trường Hợp âm");
      setTimeout(() => {
        document.querySelector('input[name="tags"]')?.focus();
      }, 100);
      return;
    }
    if (!form.excerpt.trim()) {
      setError("Thiếu tóm tắt bài hát");
      setTimeout(() => {
        document.querySelector('textarea[name="excerpt"]')?.focus();
      }, 100);
      return;
    }
    if (!form.lyrics.trim()) {
      setError("Thiếu lời bài hát");
      setTimeout(() => {
        document.querySelector('textarea[name="lyrics"]')?.focus();
      }, 100);
      return;
    }

    const payload = {
      title: form.title,
      subtitle: form.subtitle || undefined,
      artists: form.artists
        ? form.artists.split(",").map((a) => a.trim())
        : [],
      posterName: form.posterName || undefined,
      postedAt: form.postedAt ? new Date(form.postedAt) : new Date(), // Sử dụng ngày hiện tại nếu không có
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

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <label>
            Tiêu đề *
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
          </label>

          <label>
            Phụ đề
            <input
              type="text"
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
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
            Thể loại
            <input
              type="text"
              name="styleLabel"
              value={form.styleLabel}
              onChange={handleChange}
            />
          </label>

          <label>
            Hợp âm sử dụng (cách nhau dấu phẩy) *
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
            />
          </label>

          <label>
            Tóm tắt *
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <label>
            Lời bài hát *
            <textarea
              name="lyrics"
              value={form.lyrics}
              onChange={handleChange}
              rows={6}
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
