import { useEffect, useState } from "react";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import PostCard from "../../components/forum/PostCard/PostCard";
import ChatWidget from "../../components/chat/ChatWidget";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [bio, setBio] = useState("");
  const [intro, setIntro] = useState({ location: "", birthday: "", education: "" });

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("user");
      setUser(rawUser ? JSON.parse(rawUser) : null);
      let rawBio = localStorage.getItem("user_bio");
      if (!rawBio || !rawBio.trim()) {
        rawBio =
          "Yêu guitar, thích fingerstyle và acoustic.\nMục tiêu 2026: luyện 30 phút mỗi ngày.";
        localStorage.setItem("user_bio", rawBio);
      }
      setBio(rawBio);
      // intro defaults
      let rawIntro = localStorage.getItem("user_intro");
      if (!rawIntro) {
        const def = {
          location: "TP. Hồ Chí Minh, Việt Nam",
          birthday: "01/01/2000",
          education: "Đại học CNTT",
        };
        localStorage.setItem("user_intro", JSON.stringify(def));
        rawIntro = JSON.stringify(def);
      }
      try {
        setIntro(JSON.parse(rawIntro));
      } catch {
        setIntro({ location: "", birthday: "", education: "" });
      }
    } catch {}
    const load = () => {
      try {
        const raw = localStorage.getItem("user_posts");
        let arr = raw ? JSON.parse(raw) : [];
        // Seed 20 sample posts if empty
        if (!Array.isArray(arr) || arr.length === 0) {
          const now = Date.now();
          const sampleTexts = [
            "Hôm nay luyện 30 phút chromatic, cảm giác tay trái đỡ cứng hơn.",
            "Chia sẻ tab intro bài Hotel California mình mới soạn.",
            "Anh em có preset reverb/delay nào hợp acoustic không?",
            "Ngày mưa, làm tách cà phê và gảy vài hợp âm.",
            "Vừa thay dây Elixir 11-52, cảm giác trơn tay.",
            "Luyện metronome 80bpm alternate picking đều dần.",
            "Cover nhanh một đoạn City of Stars 🎶",
            "Gợi ý capo nào kẹp chắc mà không lệch tone?",
            "Ảnh góc tập mới giản dị nhưng đủ dùng!",
            "Học hợp âm 7 nghe mượt tai quá.",
          ];
          const sampleImages = [
            "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1520975682031-c83b66c1113b?q=80&w=1200&auto=format&fit=crop",
          ];
          const u = (() => {
            try {
              const ru = localStorage.getItem("user");
              return ru ? JSON.parse(ru) : null;
            } catch { return null; }
          })();
          const authorName = u?.fullName || u?.username || "Tôi";
          const authorAvatarUrl = u?.avatarUrl || "";
          arr = Array.from({ length: 20 }).map((_, i) => ({
            id: `seed-${now - i}`,
            authorName,
            authorAvatarUrl,
            time: new Date(now - i * 3600 * 1000).toLocaleString("vi-VN", { hour12: false }),
            content: sampleTexts[i % sampleTexts.length],
            imageUrl: i % 2 === 0 ? sampleImages[i % sampleImages.length] : "",
          }));
          localStorage.setItem("user_posts", JSON.stringify(arr));
        }
        setPosts(arr);
      } catch {
        setPosts([]);
      }
    };
    load();
    const onChanged = () => load();
    window.addEventListener("user:new-post", onChanged);
    window.addEventListener("user:post-changed", onChanged);
    return () => {
      window.removeEventListener("user:new-post", onChanged);
      window.removeEventListener("user:post-changed", onChanged);
    };
  }, []);

  function handleEditBio() {
    // eslint-disable-next-line no-alert
    const next = window.prompt("Chỉnh sửa mô tả", bio || "");
    if (next === null) return;
    const clean = String(next);
    setBio(clean);
    try { localStorage.setItem("user_bio", clean); } catch {}
  }

  function handleEditIntro() {
    // Thu thập từng trường qua prompt nhanh
    // eslint-disable-next-line no-alert
    const loc = window.prompt("Nơi sống", intro.location || "") ?? intro.location;
    // eslint-disable-next-line no-alert
    const bd = window.prompt("Ngày sinh (dd/mm/yyyy)", intro.birthday || "") ?? intro.birthday;
    // eslint-disable-next-line no-alert
    const edu = window.prompt("Học vấn", intro.education || "") ?? intro.education;
    const next = { location: String(loc || ""), birthday: String(bd || ""), education: String(edu || "") };
    setIntro(next);
    try { localStorage.setItem("user_intro", JSON.stringify(next)); } catch {}
  }

  return (
    <div className={styles._page}>
      <Header />
      <main className={styles._main}>
        <div className={styles._container}>
          <div className={styles._headerCard}>
            {user?.avatarUrl ? (
              <img className={styles._avatar} src={user.avatarUrl} alt="" />
            ) : (
              <div className={styles._avatar} />
            )}
            <div className={styles._name}>{user?.fullName || user?.username || "Tôi"}</div>
            {bio?.trim() ? <div className={styles._bioText}>{bio}</div> : null}
            <div className={styles._introList}>
              {intro.location ? (
                <div className={styles._introItem}><span className={styles._introLabel}>Nơi sống:</span> {intro.location}</div>
              ) : null}
              {intro.birthday ? (
                <div className={styles._introItem}><span className={styles._introLabel}>Ngày sinh:</span> {intro.birthday}</div>
              ) : null}
              {intro.education ? (
                <div className={styles._introItem}><span className={styles._introLabel}>Học vấn:</span> {intro.education}</div>
              ) : null}
            </div>
            <div className={styles._introActions}>
              <button className={styles._btnPrimary} onClick={handleEditBio}>Chỉnh sửa mô tả</button>
              <button className={styles._btnGhost} onClick={handleEditIntro}>Chỉnh sửa giới thiệu</button>
            </div>
          </div>

          <div className={styles._feed}>
            {posts.length === 0 ? (
              <div>Chưa có bài viết nào.</div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

