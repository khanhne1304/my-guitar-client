import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import styles from "../ProfilePage/ProfilePage.module.css";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicUserProfileApi } from "../../../services/userService";
import { forumApi } from "../../../services/forumApi";
import ThreadCard from "../../components/forum/ThreadCard/ThreadCard";

function avatarFromName(name) {
  if (!name) return "";
  const code = Array.from(name).reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const img = (code % 70) + 1;
  return `https://i.pravatar.cc/80?img=${img}`;
}

export default function UserProfilePage() {
  const { username } = useParams();
  const idOrName = decodeURIComponent(username || "");
  const isMongoId = useMemo(() => /^[a-f\d]{24}$/i.test(idOrName), [idOrName]);
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState("");

  const displayName = user?.fullName || user?.username || idOrName || "Người dùng";
  const avatar = useMemo(() => {
    const url = user?.avatarUrl;
    if (url) return url;
    return avatarFromName(displayName);
  }, [user?.avatarUrl, displayName]);
  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(false);

  useEffect(() => {
    let alive = true;
    const loadUser = async () => {
      setLoadError("");
      setUser(null);
      if (!isMongoId) return;
      try {
        const data = await getPublicUserProfileApi(idOrName);
        if (!alive) return;
        setUser(data || null);
      } catch (err) {
        if (!alive) return;
        const status = err?.response?.status ?? err?.status;
        if (status === 404) setLoadError("Không tìm thấy người dùng.");
        else if (status === 401) setLoadError("Bạn cần đăng nhập để xem trang cá nhân.");
        else setLoadError(err?.response?.data?.message || err?.message || "Không thể tải trang cá nhân.");
      }
    };
    loadUser();
    return () => {
      alive = false;
    };
  }, [idOrName, isMongoId]);

  useEffect(() => {
    let alive = true;
    if (!isMongoId) {
      setThreads([]);
      return () => {};
    }
    (async () => {
      try {
        setLoadingThreads(true);
        const data = await forumApi.listThreads({ userId: String(idOrName), sort: "newest" });
        if (!alive) return;
        setThreads(Array.isArray(data) ? data : []);
      } catch {
        if (!alive) return;
        setThreads([]);
      } finally {
        if (!alive) return;
        setLoadingThreads(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [idOrName, isMongoId]);

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
            <div className={styles._name}>{displayName}</div>
            {loadError ? <div className={styles._bioText}>{loadError}</div> : null}
            {user?.bio?.trim() ? <div className={styles._bioText}>{user.bio}</div> : null}
          </div>

          <div className={styles._feed}>
            {loadingThreads ? (
              <div>Đang tải chủ đề...</div>
            ) : threads.length === 0 ? (
              <div>Người dùng này chưa có chủ đề nào.</div>
            ) : (
              threads.map((t) => (
                <ThreadCard
                  key={t._id || t.id}
                  thread={t}
                  onDeleted={(id) => setThreads((prev) => (prev || []).filter((x) => String(x?._id || x?.id) !== String(id)))}
                />
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

