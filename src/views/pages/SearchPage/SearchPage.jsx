import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import styles from "./SearchPage.module.css";
import { apiClient } from "../../../services/apiClient";
import ThreadCard from "../../components/forum/ThreadCard/ThreadCard";
import { forumApi } from "../../../services/forumApi";
import {
  getFriendsApi,
  searchUsersApi,
  sendFriendRequestApi,
  unfriendApi,
} from "../../../services/userService";
import { useConfirm } from "../../../context/ConfirmContext";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function hashStringToHue(input) {
  const s = String(input || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

function createInitialsAvatarDataUri(name, size = 80) {
  const safeName = String(name || "").trim();
  const initials = safeName
    ? safeName
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "U";

  const hue = hashStringToHue(safeName || initials);
  const bg = `hsl(${hue} 70% 45%)`;
  const fg = "white";
  const fontSize = Math.round(size * 0.42);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${Math.round(size / 2)}" fill="${bg}"/>
      <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial" font-size="${fontSize}" fill="${fg}" font-weight="700">
        ${initials}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function mapUser(u) {
  const username = u?.username || "";
  const displayName = u?.fullName || u?.username || "Người dùng";
  const fallbackAvatar = createInitialsAvatarDataUri(displayName);
  return {
    id: u?._id || u?.id,
    username,
    name: displayName,
    mutual: u?.mutualCount ?? 0,
    avatar: apiClient.ensureAbsolute(u?.avatarUrl) || fallbackAvatar,
    fallbackAvatar,
    profileSlug: username ? username : "",
  };
}

export default function SearchPage({ embedded = false }) {
  const params = useQuery();
  const [tab, setTab] = useState("users"); // users | posts (threads)
  const [q, setQ] = useState(params.get("q") || "");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [requesting, setRequesting] = useState(() => new Set());
  const [requested, setRequested] = useState(() => new Set());
  const [friendIds, setFriendIds] = useState(() => new Set());
  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getFriendsApi();
        const arr = Array.isArray(res) ? res : res?.data;
        const ids = new Set((arr || []).map((u) => String(u?._id || u?.id)).filter(Boolean));
        if (!alive) return;
        setFriendIds(ids);
      } catch {
        if (!alive) return;
        setFriendIds(new Set());
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const term = q.trim().toLowerCase();
    // server search already filters, but keep this for instant UI filtering
    if (!term) return users;
    return users.filter((u) => u.name.toLowerCase().includes(term));
  }, [q, users]);

  useEffect(() => {
    let alive = true;
    const term = q.trim();
    if (!term) {
      setThreads([]);
      setLoadingThreads(false);
      return () => {};
    }
    const t = setTimeout(async () => {
      try {
        setLoadingThreads(true);
        const res = await forumApi.listThreads({ q: term, sort: "newest" });
        if (!alive) return;
        setThreads(Array.isArray(res) ? res : []);
      } catch {
        if (!alive) return;
        setThreads([]);
      } finally {
        if (!alive) return;
        setLoadingThreads(false);
      }
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    let alive = true;
    const term = q.trim();
    if (!term) {
      setUsers([]);
      setLoadingUsers(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoadingUsers(true);
        const res = await searchUsersApi({ q: term, limit: 24 });
        const arr = Array.isArray(res) ? res : res?.data;
        if (!alive) return;
        setUsers((arr || []).map(mapUser));
      } catch {
        if (!alive) return;
        setUsers([]);
      } finally {
        if (!alive) return;
        setLoadingUsers(false);
      }
    }, 300);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  const sendRequest = async (userId) => {
    if (!userId) return;
    if (friendIds.has(String(userId))) return;
    if (requested.has(userId)) return;
    setRequesting((prev) => new Set(prev).add(userId));
    try {
      await sendFriendRequestApi(userId);
      setRequested((prev) => new Set(prev).add(userId));
    } catch {
      // ignore
    } finally {
      setRequesting((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const unfriendFromSearch = async (u) => {
    const userId = u?.id;
    if (!userId) return;
    if (!friendIds.has(String(userId))) return;

    const ok = await confirm(`Hủy kết bạn với ${u.name}?`);
    if (!ok) return;

    try {
      await unfriendApi(userId);
      setFriendIds((prev) => {
        const next = new Set(prev);
        next.delete(String(userId));
        return next;
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className={styles.page}>
      {embedded ? null : <Header />}
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.panel}>
            <div className={styles.searchRow}>
              <input
                className={styles.searchInput}
                placeholder="Tìm người dùng hoặc chủ đề..."
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
                  Từ khóa/Chủ đề
                </button>
              </div>
            </div>

            {tab === "users" ? (
              <div className={styles.userGrid}>
                {loadingUsers ? (
                  <div className={styles.empty}>Đang tìm kiếm...</div>
                ) : (
                  filteredUsers.map((u) => (
                  <div key={u.id} className={styles.userCard}>
                    <img
                      src={u.avatar}
                      alt=""
                      className={styles.userAvatar}
                      onError={(e) => {
                        // fallback nếu avatar từ server lỗi/404
                        if (!u?.fallbackAvatar) return;
                        if (e.currentTarget.src === u.fallbackAvatar) return;
                        e.currentTarget.src = u.fallbackAvatar;
                      }}
                    />
                    <div className={styles.userName}>{u.name}</div>
                    <div className={styles.userMeta}>{u.mutual} bạn chung</div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <Link
                        className={styles.userBtn}
                        to={`/u/${encodeURIComponent(u.id || "")}`}
                        title={`Xem trang của ${u.name}`}
                      >
                        Xem trang
                      </Link>
                      <button
                        className={styles.userBtn}
                        disabled={requesting.has(u.id) || requested.has(u.id)}
                        onClick={() =>
                          friendIds.has(String(u.id)) ? unfriendFromSearch(u) : sendRequest(u.id)
                        }
                        title={friendIds.has(String(u.id)) ? "Hủy kết bạn" : "Gửi lời mời kết bạn"}
                      >
                        {friendIds.has(String(u.id))
                          ? "Bạn bè"
                          : requested.has(u.id)
                          ? "Đã gửi"
                          : requesting.has(u.id)
                          ? "Đang gửi..."
                          : "Kết bạn"}
                      </button>
                    </div>
                  </div>
                  ))
                )}
                {filteredUsers.length === 0 && (
                  <div className={styles.empty}>Không tìm thấy người dùng phù hợp.</div>
                )}
              </div>
            ) : (
              <div className={styles.postList}>
                {loadingThreads ? (
                  <div className={styles.empty}>Đang tìm kiếm...</div>
                ) : (threads || []).length === 0 ? (
                  <div className={styles.empty}>Không có chủ đề phù hợp.</div>
                ) : (
                  (threads || []).map((t) => (
                    <ThreadCard key={t._id || t.id} thread={t} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      {embedded ? null : <Footer />}
    </div>
  );
}

