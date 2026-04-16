import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import PostCard from "../../components/forum/PostCard/PostCard";

export default function ForumPostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    // Try resolve from localStorage 'user_posts' first
    const resolve = () => {
      try {
        const raw = localStorage.getItem("user_posts");
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr)) {
          const found = arr.find((p) => String(p.id) === String(postId));
          if (found) {
            setPost(found);
            return;
          }
        }
      } catch {}
      // Fallback to 'reported_posts' snapshot
      try {
        const rawRep = localStorage.getItem("reported_posts");
        const arrRep = rawRep ? JSON.parse(rawRep) : [];
        if (Array.isArray(arrRep)) {
          const r = arrRep.find((x) => String(x.postId) === String(postId));
          if (r?.snapshot) {
            setPost({
              id: r.postId,
              authorName: r.snapshot.authorName,
              authorAvatarUrl: r.snapshot.authorAvatarUrl,
              time: r.snapshot.time,
              content: r.snapshot.content,
              imageUrl: r.snapshot.imageUrl,
            });
            return;
          }
        }
      } catch {}
      setPost(null);
    };
    resolve();
  }, [postId]);

  return (
    <div style={{ background: "#fffbe8", minHeight: "100vh" }}>
      <Header />
      <main style={{ padding: "24px 0 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
          {!post ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 16,
                textAlign: "center",
              }}
            >
              Không tìm thấy bài viết.
            </div>
          ) : (
            <PostCard post={post} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

