import { useEffect, useState } from "react";
import styles from "./FriendRequestsPage.module.css";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import { apiClient } from "../../../services/apiClient";
import { useNavigate } from "react-router-dom";
import {
  acceptFriendRequestApi,
  cancelOrDeclineFriendRequestApi,
  getFriendRequestsApi,
} from "../../../services/userService";

function initialsFromName(name) {
  const safe = (name || "").trim();
  if (!safe) return "?";
  const parts = safe.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase() || "?";
}

function mapUser(u) {
  return {
    id: u?._id || u?.id,
    name: u?.fullName || u?.username || "Người dùng",
    mutual: u?.mutualCount ?? 0,
    avatar: apiClient.ensureAbsolute(u?.avatarUrl) || "",
  };
}

export default function FriendRequestsPage({ embedded = false }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getFriendRequestsApi();
        const arr = Array.isArray(res) ? res : res?.data;
        if (!alive) return;
        setRequests((arr || []).map(mapUser));
      } catch {
        if (!alive) return;
        setRequests([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const accept = async (id) => {
    try {
      await acceptFriendRequestApi(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {}
  };
  const remove = async (id) => {
    try {
      await cancelOrDeclineFriendRequestApi(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {}
  };

  return (
    <div className={styles.page}>
      {embedded ? null : <Header />}
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.titleBar}>
            <div className={styles.title}>Lời mời kết bạn</div>
            <a href="#" className={styles.seeAll}>Xem tất cả</a>
          </div>
          <div className={styles.grid}>
            {loading ? (
              <div>Đang tải...</div>
            ) : requests.length === 0 ? (
              <div>Không có lời mời kết bạn.</div>
            ) : (
              requests.map((r) => (
              <div
                key={r.id}
                className={styles.card}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/u/${encodeURIComponent(r.id || "")}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/u/${encodeURIComponent(r.id || "")}`);
                  }
                }}
              >
                {r.avatar ? (
                  <img src={r.avatar} alt="" className={styles.cover} />
                ) : (
                  <div className={styles.coverFallback} aria-hidden="true">
                    {initialsFromName(r.name)}
                  </div>
                )}
                <div className={styles.content}>
                  <div className={styles.name}>{r.name}</div>
                  <div className={styles.meta}>{r.mutual} bạn chung</div>
                  <div className={styles.actions}>
                    <button
                      className={styles.accept}
                      onClick={(e) => {
                        e.stopPropagation();
                        accept(r.id);
                      }}
                    >
                      Xác nhận
                    </button>
                    <button
                      className={styles.remove}
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(r.id);
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </main>
      {embedded ? null : <Footer />}
    </div>
  );
}

