import { useEffect, useRef, useState } from "react";
import { FaImage } from "react-icons/fa";
import styles from "./Composer.module.css";
import ComposeModal from "../ComposerModal/ComposeModal";

export default function Composer() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // array of data URLs (persistable)
  const fileRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

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

  const pickImages = () => {
    // Reset value để chọn lại cùng 1 file vẫn trigger onChange
    if (fileRef.current) fileRef.current.value = "";
    fileRef.current?.click();
  };
  const onFiles = async (files) => {
    if (!files?.length) return;
    const toDataUrl = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    const urls = [];
    for (const f of Array.from(files)) {
      try {
        if (!/^image\//.test(f.type)) continue;
        if (f.size > 5 * 1024 * 1024) continue; // limit 5MB
        // eslint-disable-next-line no-await-in-loop
        const dataUrl = await toDataUrl(f);
        urls.push(dataUrl);
      } catch {}
    }
    if (urls.length) {
      setImages((prev) => [...prev, ...urls]);
      setOpen(true);
    }
  };
  const openComposer = () => {
    setOpen(true);
  };
  const openComposerMouseDown = (e) => {
    // Ngăn input nhận focus để tránh hiệu ứng nhấp nháy placeholder
    e.preventDefault();
    setOpen(true);
  };
  const closeComposer = () => {
    setOpen(false);
    setContent("");
    setImages([]);
  };
  const submit = () => {
    // Save to localStorage for Profile page history
    try {
      const post = {
        id: Date.now().toString(),
        authorId: currentUser?.id || currentUser?._id || currentUser?.userId || "self",
        authorName: currentUser?.fullName || currentUser?.username || "Tôi",
        authorAvatarUrl: currentUser?.avatarUrl || "",
        time: new Date().toLocaleString("vi-VN", { hour12: false }),
        content: content || "",
        imageUrl: images?.[0] || "",
      };
      const raw = localStorage.getItem("user_posts");
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(post);
      localStorage.setItem("user_posts", JSON.stringify(list));
      try {
        window.dispatchEvent(new CustomEvent("user:new-post", { detail: post }));
        window.dispatchEvent(new Event("user:post-changed"));
      } catch {}
    } catch {}
    setOpen(false);
    setContent("");
    setImages([]);
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
            placeholder="Bạn đang nghĩ gì?"
            onMouseDown={openComposerMouseDown}
            readOnly
          />
        </div>
        <div className={styles._actions}>
          <button className={styles._actionBtn} onClick={pickImages}>
            <FaImage color="#45bd62" />
            <span>Ảnh/video</span>
          </button>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileRef}
          style={{ display: "none" }}
          onChange={(e) => {
            onFiles(e.target.files);
            // Reset value để lần sau chọn lại cùng file vẫn chạy
            e.target.value = "";
          }}
        />
      </div>

      <ComposeModal
        open={open}
        onClose={closeComposer}
        content={content}
        setContent={setContent}
        images={images}
        setImages={setImages}
        onPickImages={pickImages}
        onSubmit={submit}
        userAvatarUrl={currentUser?.avatarUrl}
      />
    </>
  );
}

