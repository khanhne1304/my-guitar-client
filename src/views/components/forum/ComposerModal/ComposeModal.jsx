import { useMemo } from "react";
import styles from "./ComposeModal.module.css";

export default function ComposeModal({
  open,
  onClose,
  title,
  setTitle,
  category,
  setCategory,
  tagsText,
  setTagsText,
  content,
  setContent,
  videoUrl,
  setVideoUrl,
  files = [],
  onFilesSelected,
  onRemoveFileAt,
  onSubmit,
  userAvatarUrl,
  submitting = false,
  submitError = "",
}) {
  const modalStyle = useMemo(() => undefined, []);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>Tạo chủ đề</div>
          <button className={styles.close} onClick={onClose} aria-label="Đóng">×</button>
        </div>
        <div className={styles.body}>
          <div className={styles.row}>
            {userAvatarUrl ? (
              <img className={styles.avatar} src={userAvatarUrl} alt="" style={{ borderRadius: '9999px', objectFit: 'cover' }} />
            ) : (
              <div className={styles.avatar} />
            )}
            <div className={styles.identity}>
              <div className={styles.name}>Bạn</div>
              <div className={styles.hint}>Chọn loại chủ đề & danh mục để dễ học hơn.</div>
            </div>
          </div>

          <input
            className={styles.input}
            placeholder="Tiêu đề (bắt buộc)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            maxLength={120}
          />

          <label className={styles.field}>
            <span className={styles.label}>Danh mục</span>
            <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="lesson">Học guitar</option>
              <option value="tab">Tab guitar</option>
              <option value="chord">Hợp âm</option>
              <option value="discussion">Thảo luận</option>
            </select>
          </label>

          <input
            className={styles.input}
            placeholder="Thẻ (vd: bending, barre, metronome) – phân tách bằng dấu phẩy"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            maxLength={160}
          />

          <label className={styles.field}>
            <span className={styles.label}>Upload file (pdf / ảnh / mp3)</span>
            <input
              className={styles.input}
              type="file"
              multiple
              accept="application/pdf,image/*,audio/mpeg"
              onChange={(e) => {
                const fl = e.target.files;
                if (onFilesSelected) onFilesSelected(fl);
                e.target.value = "";
              }}
              disabled={submitting}
            />
            {Array.isArray(files) && files.length ? (
              <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                {files.map((f, idx) => (
                  <div
                    key={`${f?.url || idx}`}
                    style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}
                  >
                    <div style={{ fontSize: 12, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <b>{String(f?.type || "").toUpperCase()}</b> — {f?.name || f?.url}
                    </div>
                    <button
                      className={styles.secondary}
                      type="button"
                      onClick={() => onRemoveFileAt && onRemoveFileAt(idx)}
                      disabled={submitting}
                      style={{ padding: "6px 10px" }}
                    >
                      Xoá
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </label>

          <input
            className={styles.input}
            placeholder="Link YouTube (tuỳ chọn)"
            value={videoUrl || ""}
            onChange={(e) => setVideoUrl(e.target.value)}
            maxLength={300}
          />

          <textarea
            className={styles.textarea}
            placeholder="Nội dung… (mô tả rõ bối cảnh luyện tập, mục tiêu, và vấn đề gặp phải)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            tabIndex={0}
            maxLength={5000}
          />

          {submitError ? <div className={styles.error}>{submitError}</div> : null}

          <div className={styles.actions}>
            <button className={styles.secondary} onClick={onClose} type="button" disabled={submitting}>
              Huỷ
            </button>
            <button
              className={styles.submit}
              onClick={onSubmit}
              disabled={submitting || !title?.trim() || !content.trim()}
              aria-disabled={submitting || !title?.trim() || !content.trim()}
            >
              {submitting ? "Đang đăng..." : "Đăng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

