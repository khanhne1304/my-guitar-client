import { useEffect, useState } from "react";
import styles from "./Composer.module.css";
import ComposeModal from "../ComposerModal/ComposeModal";
import { forumApi } from "../../../../services/forumApi";

export default function Composer() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("lesson");
  const [tagsText, setTagsText] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [files, setFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("user");
        setCurrentUser(raw ? JSON.parse(raw) : null);
      } catch {}
    };
    loadUser();
    const onProfileChanged = () => loadUser();
    window.addEventListener("user:profile-changed", onProfileChanged);
    // Also react to localStorage updates across tabs/windows
    const onStorage = (e) => {
      if (e?.key === "user") loadUser();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("user:profile-changed", onProfileChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const openComposerMouseDown = (e) => {
    // Ngăn input nhận focus để tránh hiệu ứng nhấp nháy placeholder
    e.preventDefault();
    setOpen(true);
  };
  const closeComposer = () => {
    setOpen(false);
    setTitle("");
    setCategory("lesson");
    setTagsText("");
    setContent("");
    setVideoUrl("");
    setFiles([]);
    setSubmitting(false);
    setSubmitError("");
  };

  const uploadSelectedFiles = async (fileList) => {
    const list = Array.from(fileList || []).slice(0, 5);
    if (!list.length) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      const uploaded = [];
      for (const f of list) {
        const res = await forumApi.uploadFile(f);
        if (res?.url && res?.type) uploaded.push({ url: res.url, type: res.type, name: res.originalname || f.name });
      }
      setFiles((prev) => [...prev, ...uploaded].slice(0, 10));
    } catch (e) {
      setSubmitError(e?.message || "Không thể upload file. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeFileAt = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const isGuitarRelatedWeak = (text) => {
    const s = String(text || "").toLowerCase();
    const kws = ["guitar", "đàn", "chord", "tab", "fingerstyle", "strumming", "hợp âm", "scale"];
    return kws.some((k) => s.includes(k));
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      if (!isGuitarRelatedWeak(`${title} ${content}`)) {
        setSubmitError("Bài viết phải liên quan đến guitar (vd: guitar, chord, tab, hợp âm...)");
        setSubmitting(false);
        return;
      }

      const tags = (tagsText || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10);

      const created = await forumApi.createThread({
        title: title || "Chủ đề mới",
        content: content || "",
        category,
        tags,
        files: files.map((f) => ({ url: f.url, type: f.type })),
        videoUrl: videoUrl || "",
      });

      try {
        window.dispatchEvent(new CustomEvent("forum:thread-created", { detail: created }));
      } catch {}

      closeComposer();
    } catch (e) {
      setSubmitError(e?.message || "Không thể đăng bài. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles._card}>
        <div className={styles._row}>
          {currentUser?.avatarUrl ? (
            <img className={styles._avatar} src={currentUser.avatarUrl} alt="" style={{ borderRadius: '9999px', objectFit: 'cover' }} />
          ) : (
            <div className={styles._avatar} />
          )}
          <input
            className={styles._input}
            placeholder="Bạn muốn hỏi/chia sẻ điều gì về guitar?"
            onMouseDown={openComposerMouseDown}
            readOnly
          />
        </div>
      </div>

      <ComposeModal
        open={open}
        onClose={closeComposer}
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        tagsText={tagsText}
        setTagsText={setTagsText}
        content={content}
        setContent={setContent}
        videoUrl={videoUrl}
        setVideoUrl={setVideoUrl}
        files={files}
        onFilesSelected={uploadSelectedFiles}
        onRemoveFileAt={removeFileAt}
        onSubmit={submit}
        userAvatarUrl={currentUser?.avatarUrl}
        submitting={submitting}
        submitError={submitError}
      />
    </>
  );
}

