import { useEffect, useMemo, useState } from "react";
import styles from "./ComposeModal.module.css";

export default function ComposeModal({
  open,
  onClose,
  content,
  setContent,
  images,
  setImages,
  onPickImages,
  onSubmit,
  userAvatarUrl,
}) {
  const [visOpen, setVisOpen] = useState(false);
  const [visibility, setVisibility] = useState("Công khai"); // Công khai | Bạn bè | Riêng tư
  const [mediaWidth, setMediaWidth] = useState(null);

  const removeAt = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Tính chiều rộng modal theo bức ảnh đầu tiên
  useEffect(() => {
    if (!images?.length) {
      setMediaWidth(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const vw = Math.max(320, (typeof window !== "undefined" ? window.innerWidth : 1200) - 48);
      const w = Math.max(420, Math.min(img.naturalWidth, 800, vw));
      setMediaWidth(w);
    };
    img.src = images[0];
  }, [images]);

  const modalStyle = useMemo(() => (mediaWidth ? { width: mediaWidth } : undefined), [mediaWidth]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>Tạo bài viết</div>
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
              <button
                type="button"
                className={styles.visBtn}
                onClick={() => setVisOpen((v) => !v)}
                aria-expanded={visOpen}
              >
                {visibility}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              {visOpen && (
                <div className={styles.visMenu}>
                  {["Công khai", "Bạn bè", "Riêng tư"].map((opt) => (
                    <div
                      key={opt}
                      className={styles.visItem}
                      onClick={() => {
                        setVisibility(opt);
                        setVisOpen(false);
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <textarea
            className={styles.textarea}
            placeholder="Bạn đang nghĩ gì?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
            tabIndex={0}
          />

          {!!images.length && images.length === 1 && (
            <div className={styles.mediaBox}>
              <img src={images[0]} alt="" />
              <button
                className={styles.remove}
                onClick={() => removeAt(0)}
                aria-label="Xoá"
                title="Xoá ảnh"
              >
                ×
              </button>
            </div>
          )}
          {!!images.length && images.length > 1 && (
            <div className={styles.images}>
              {images.map((src, idx) => (
                <div key={idx} className={styles.thumb}>
                  <img src={src} alt="" />
                  <button className={styles.remove} onClick={() => removeAt(idx)} aria-label="Xoá">×</button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.attachBtn} onClick={onPickImages}>
              Thêm ảnh/video
            </button>
            <button
              className={styles.submit}
              onClick={onSubmit}
              disabled={!content.trim() && images.length === 0}
              aria-disabled={!content.trim() && images.length === 0}
            >
              Đăng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

