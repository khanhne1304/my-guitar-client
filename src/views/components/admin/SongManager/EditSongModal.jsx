import { useEffect, useState } from "react";
import { songService } from "../../../../services/songService";
import styles from "./EditSongModal.module.css";

export default function EditSongModal({ open, onClose, song, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    artists: "",
    posterName: "",
    postedAt: "",
    styleLabel: "",
    tags: "",
    excerpt: "",
    lyrics: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (song) {
      setForm({
        title: song.title || "",
        subtitle: song.subtitle || "",
        artists: song.artists?.join(", ") || "",
        posterName: song.posterName || "",
        postedAt: song.postedAt ? song.postedAt.slice(0, 10) : "",
        styleLabel: song.styleLabel || "",
        tags: song.tags?.join(", ") || "",
        excerpt: song.excerpt || "",
        lyrics: song.lyrics || "",
      });
    }
  }, [song]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await songService.update(song._id, {
        ...form,
        artists: form.artists.split(",").map((a) => a.trim()).filter(Boolean),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        postedAt: form.postedAt ? new Date(form.postedAt).toISOString() : null,
      });
      onSuccess?.(); // reload list
      onClose?.(); // close modal
    } catch (error) {
      console.error("Lỗi khi cập nhật bài hát:", error);
      setErr(error.message || "Không thể cập nhật bài hát");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Chỉnh sửa bài hát</h2>

        {err && <div className={styles.error}>{err}</div>}

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
            Phụ đề
            <input
              type="text"
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
            />
          </label>

          <label>
            Nghệ sĩ (cách nhau dấu phẩy)
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
            Tags (cách nhau dấu phẩy)
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
            />
          </label>

          <label>
            Tóm tắt
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
              required
              rows={6}
            />
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={loading}
            >
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
