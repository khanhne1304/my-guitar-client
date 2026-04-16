import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import styles from "./SearchPage.module.css";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const seedFriends = [
  { id: "f1", name: "Minh Thi", mutual: 12, avatar: "https://i.pravatar.cc/200?img=12" },
  { id: "f2", name: "Khoa Lê", mutual: 4, avatar: "https://i.pravatar.cc/200?img=22" },
  { id: "f3", name: "Nguyễn Duy Khánh", mutual: 50, avatar: "https://i.pravatar.cc/200?img=5" },
  { id: "f4", name: "Laam Ly", mutual: 14, avatar: "https://i.pravatar.cc/200?img=28" },
  { id: "f5", name: "Nguyễn Hoàng Nam", mutual: 37, avatar: "https://i.pravatar.cc/200?img=17" },
  { id: "f6", name: "Nguyệt Anh", mutual: 2, avatar: "https://i.pravatar.cc/200?img=43" },
  { id: "f7", name: "Vũ Văn Đức", mutual: 2, avatar: "https://i.pravatar.cc/200?img=48" },
  { id: "f8", name: "Đạt Tiên", mutual: 33, avatar: "https://i.pravatar.cc/200?img=7" },
  { id: "f9", name: "Bình Nhi", mutual: 45, avatar: "https://i.pravatar.cc/200?img=38" },
];

const seedPosts = [
  {
    id: "p1",
    authorName: "Ngọc Mai",
    authorAvatarUrl: "https://i.pravatar.cc/80?img=12",
    time: "2 giờ trước",
    content:
      "Mọi người có gợi ý gì để tập legato mượt hơn không? Mình đang theo bài 1-2-3-4 nhưng chưa đều tay.",
    imageUrl: "",
  },
  {
    id: "p2",
    authorName: "Thanh Tùng",
    authorAvatarUrl: "https://i.pravatar.cc/80?img=5",
    time: "Hôm qua",
    content: "Chia sẻ backing track blues A minor cho anh em jam!",
    imageUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: "p3",
    authorName: "Hà Linh",
    authorAvatarUrl: "https://i.pravatar.cc/80?img=32",
    time: "3 giờ trước",
    content: "Mới thay dây Elixir, cảm giác trơn tay hơn hẳn! Mọi người hay dùng loại nào?",
    imageUrl: "",
  },
];

export default function SearchPage() {
  const params = useQuery();
  const [tab, setTab] = useState("users"); // users | posts
  const [q, setQ] = useState(params.get("q") || "");
  const [users, setUsers] = useState(seedFriends);
  const [posts, setPosts] = useState(seedPosts);

  // Load posts from localStorage if any
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user_posts");
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr) && arr.length) {
        setPosts((prev) => [...arr.map((p) => ({ ...p, id: p.id || String(p.time) })) , ...prev]);
      }
    } catch {}
  }, []);

  const filteredUsers = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => u.name.toLowerCase().includes(term));
  }, [q, users]);

  const filteredPosts = useMemo(() => {
    const term = q.trim().toLowerCase();
    // When no keyword, don't show any posts to avoid looking like a personal feed
    if (!term) return [];
    return posts.filter(
      (p) =>
        p.content?.toLowerCase().includes(term) ||
        p.authorName?.toLowerCase().includes(term)
    );
  }, [q, posts]);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.panel}>
            <div className={styles.searchRow}>
              <input
                className={styles.searchInput}
                placeholder="Tìm người dùng hoặc bài viết..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${tab === "users" ? styles.tabActive : ""}`}
                  onClick={() => setTab("users")}
                >
                  Người dùng
                </button>
                <button
                  className={`${styles.tab} ${tab === "posts" ? styles.tabActive : ""}`}
                  onClick={() => setTab("posts")}
                >
                  Từ khóa/Bài viết
                </button>
              </div>
            </div>

            {tab === "users" ? (
              <div className={styles.userGrid}>
                {filteredUsers.map((u) => (
                  <div key={u.id} className={styles.userCard}>
                    <img src={u.avatar} alt="" className={styles.userAvatar} />
                    <div className={styles.userName}>{u.name}</div>
                    <div className={styles.userMeta}>{u.mutual} bạn chung</div>
                    <Link
                      className={styles.userBtn}
                      to={`/u/${encodeURIComponent(u.name.toLowerCase().replace(/\\s+/g, "-"))}`}
                      title={`Xem trang của ${u.name}`}
                    >
                      Xem trang
                    </Link>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className={styles.empty}>Không tìm thấy người dùng phù hợp.</div>
                )}
              </div>
            ) : (
              <div className={styles.postList}>
                {filteredPosts.map((p) => (
                  <div key={p.id} className={styles.postCard}>
                    <div className={styles.postHeader}>
                      {p.authorAvatarUrl ? (
                        <img className={styles.postAvatar} src={p.authorAvatarUrl} alt="" />
                      ) : <div className={styles.postAvatar} />}
                      <div className={styles.postMeta}>
                        <div className={styles.postAuthor}>{p.authorName || "Người dùng"}</div>
                        <div className={styles.postTime}>{p.time || ""}</div>
                      </div>
                    </div>
                    {p.content ? <div className={styles.postContent}>{p.content}</div> : null}
                    {p.imageUrl ? <img className={styles.postImage} src={p.imageUrl} alt="" /> : null}
                  </div>
                ))}
                {filteredPosts.length === 0 && (
                  <div className={styles.empty}>Không có bài viết phù hợp.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

