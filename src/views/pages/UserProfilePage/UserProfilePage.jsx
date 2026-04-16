import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import styles from "../ProfilePage/ProfilePage.module.css";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

function avatarFromName(name) {
  if (!name) return "";
  const code = Array.from(name).reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const img = (code % 70) + 1;
  return `https://i.pravatar.cc/80?img=${img}`;
}

export default function UserProfilePage() {
  const { username } = useParams();
  const displayName = decodeURIComponent(username || "");
  const avatar = useMemo(() => avatarFromName(displayName), [displayName]);

  // Mock posts for this user
  const sampleTexts = [
    "Chia sẻ preset reverb/delay mình đang dùng cho acoustic.",
    "Góc tập mới set up gọn gàng.",
    "Hôm nay luyện chromatic 20 phút, tay trái linh hoạt hơn.",
  ];
  const sampleImages = [
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?q=80&w=1200&auto=format&fit=crop",
  ];
  const now = Date.now();
  const posts = Array.from({ length: 6 }).map((_, i) => ({
    id: `u-${displayName}-${i}`,
    authorName: displayName,
    authorAvatarUrl: avatar,
    time: new Date(now - i * 3600 * 1000).toLocaleString("vi-VN", { hour12: false }),
    content: sampleTexts[i % sampleTexts.length],
    imageUrl: i % 2 === 0 ? sampleImages[i % sampleImages.length] : "",
  }));

  return (
    <div className={styles._page}>
      <Header />
      <main className={styles._main}>
        <div className={styles._container}>
          <div className={styles._headerCard}>
            {avatar ? (
              <img className={styles._avatar} src={avatar} alt="" />
            ) : (
              <div className={styles._avatar} />
            )}
            <div className={styles._name}>{displayName || "Người dùng"}</div>
          </div>

          <div className={styles._feed}>
            {posts.map((p) => (
              // Lazy import without circular deps; simple inline card
              <div key={p.id} className="__postCard" style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12 }}>
                  <img src={p.authorAvatarUrl} alt="" style={{ width: 44, height: 44, borderRadius: 9999, objectFit: "cover" }} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <strong>{p.authorName}</strong>
                    <span style={{ color: "#666", fontSize: 14 }}>{p.time}</span>
                  </div>
                </div>
                {p.content ? <div style={{ padding: "0 12px 12px 12px", whiteSpace: "pre-wrap" }}>{p.content}</div> : null}
                {p.imageUrl ? <img alt="" src={p.imageUrl} style={{ width: "100%", height: 320, objectFit: "cover", background: "#f1f1f1" }} /> : null}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

