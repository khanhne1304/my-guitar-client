import { useEffect, useState } from "react";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import PostCard from "../../components/forum/PostCard/PostCard";
import Composer from "../../components/forum/Composer/Composer";
import ChatWidget from "../../components/chat/ChatWidget";
import styles from "./ProfilePage.module.css";
import { getUserProfileApi } from "../../../services/userService";
import { useNavigate } from "react-router-dom";

export default function ProfilePage({ embedded = false }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [profile, setProfile] = useState({
    bio: "",
    location: "",
    birthday: "",
    education: "",
    website: "",
    facebookUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      // prefer API, fallback local cache
      try {
        setLoadError("");
        const data = await getUserProfileApi();
        setUser(data || null);
        setProfile({
          bio: data?.bio || "",
          location: data?.location || "",
          birthday: data?.birthday || "",
          education: data?.education || "",
          website: data?.website || "",
          facebookUrl: data?.facebookUrl || "",
          youtubeUrl: data?.youtubeUrl || "",
          tiktokUrl: data?.tiktokUrl || "",
        });
        try { localStorage.setItem("user", JSON.stringify(data)); } catch {}
        return;
      } catch (err) {
        const status = err?.response?.status ?? err?.status;
        if (status === 401) {
          setLoadError("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
        } else if (status === 404) {
          setLoadError("Không tìm thấy API thông tin người dùng (`/users/profile`).");
        } else {
          setLoadError(err?.response?.data?.message || err?.message || "Không thể tải thông tin người dùng.");
        }
      }

      try {
        const rawUser = localStorage.getItem("user");
        const parsedUser = rawUser ? JSON.parse(rawUser) : null;
        setUser(parsedUser);
        setProfile({
          bio: parsedUser?.bio || "",
          location: parsedUser?.location || "",
          birthday: parsedUser?.birthday || "",
          education: parsedUser?.education || "",
          website: parsedUser?.website || "",
          facebookUrl: parsedUser?.facebookUrl || "",
          youtubeUrl: parsedUser?.youtubeUrl || "",
          tiktokUrl: parsedUser?.tiktokUrl || "",
        });
      } catch {}
    };

    load();
    const onChanged = () => load();
    window.addEventListener("user:profile-changed", onChanged);
    return () => window.removeEventListener("user:profile-changed", onChanged);
  }, []);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("user_posts");
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) {
          setPosts([]);
          return;
        }
        if (!user) {
          setPosts(arr);
          return;
        }
        const uid = user.id || user._id || user.userId || null;
        const name = user.fullName || user.username || null;
        const filtered = arr.filter((p) => {
          if (p.authorId && uid) return p.authorId === uid;
          if (name) return p.authorName === name;
          return false;
        });
        setPosts(filtered);
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
  }, [user]);

  const hasSocial =
    (profile.website && profile.website.trim()) ||
    (profile.facebookUrl && profile.facebookUrl.trim()) ||
    (profile.youtubeUrl && profile.youtubeUrl.trim()) ||
    (profile.tiktokUrl && profile.tiktokUrl.trim());

  return (
    <div className={styles._page}>
      {embedded ? null : <Header />}
      <main className={styles._main}>
        <div className={styles._container}>
          <div className={styles._headerCard}>
            {user?.avatarUrl ? (
              <img className={styles._avatar} src={user.avatarUrl} alt="" />
            ) : (
              <div className={styles._avatar} />
            )}
            <div className={styles._name}>{user?.fullName || user?.username || "Tôi"}</div>
            {loadError ? <div className={styles._bioText}>{loadError}</div> : null}
            {profile.bio?.trim() ? <div className={styles._bioText}>{profile.bio}</div> : null}
            <div className={styles._introList}>
              {profile.location ? (
                <div className={styles._introItem}><span className={styles._introLabel}>Nơi sống:</span> {profile.location}</div>
              ) : null}
              {profile.birthday ? (
                <div className={styles._introItem}><span className={styles._introLabel}>Ngày sinh:</span> {profile.birthday}</div>
              ) : null}
              {profile.education ? (
                <div className={styles._introItem}><span className={styles._introLabel}>Học vấn:</span> {profile.education}</div>
              ) : null}

              {hasSocial ? (
                <div className={styles._introItem}>
                  <span className={styles._introLabel}>Liên kết:</span>{" "}
                  {profile.website ? (
                    <a href={profile.website} target="_blank" rel="noreferrer">Website</a>
                  ) : null}
                  {profile.facebookUrl ? (
                    <>
                      {profile.website ? " · " : null}
                      <a href={profile.facebookUrl} target="_blank" rel="noreferrer">Facebook</a>
                    </>
                  ) : null}
                  {profile.youtubeUrl ? (
                    <>
                      {(profile.website || profile.facebookUrl) ? " · " : null}
                      <a href={profile.youtubeUrl} target="_blank" rel="noreferrer">YouTube</a>
                    </>
                  ) : null}
                  {profile.tiktokUrl ? (
                    <>
                      {(profile.website || profile.facebookUrl || profile.youtubeUrl) ? " · " : null}
                      <a href={profile.tiktokUrl} target="_blank" rel="noreferrer">TikTok</a>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className={styles._introActions}>
              <button
                className={styles._btnPrimary}
                onClick={() => navigate("/account/edit?returnTo=/profile")}
              >
                Chỉnh sửa trang cá nhân
              </button>
            </div>
          </div>

          <div className={styles._feed}>
            <Composer />
            {posts.length === 0 ? (
              <div>Chưa có bài viết nào.</div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>
        </div>
      </main>
      {embedded ? null : <Footer />}
      {embedded ? null : <ChatWidget />}
    </div>
  );
}

