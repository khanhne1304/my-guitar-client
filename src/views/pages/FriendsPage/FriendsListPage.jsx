import { useEffect, useMemo, useRef, useState } from "react";
import { FaEllipsisH } from "react-icons/fa";
import styles from "./FriendsListPage.module.css";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";
import { apiClient } from "../../../services/apiClient";
import { blockUserApi, getFriendsApi, unfriendApi } from "../../../services/userService";
import { useConfirm } from "../../../context/ConfirmContext";
import { useNavigate } from "react-router-dom";

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
    avatar: apiClient.ensureAbsolute(u?.avatarUrl) || "",
    addedAt: u?.createdAt || null,
    mutual: u?.mutualCount ?? 0,
  };
}

export default function FriendsListPage({ embedded = false }) {
  const [tab, setTab] = useState("all"); // all | recent
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const data = useMemo(() => {
    if (tab === "recent") {
      // coi những người có addedAt trong vòng 7 ngày là "đã thêm gần đây"
      const now = new Date();
      return friends.filter((f) => {
        if (!f.addedAt) return false;
        const dt = new Date(f.addedAt);
        return (now - dt) / (1000 * 60 * 60 * 24) <= 7;
      });
    }
    return friends;
  }, [tab, friends]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getFriendsApi();
        const arr = Array.isArray(res) ? res : res?.data;
        if (!alive) return;
        setFriends((arr || []).map(mapUser));
      } catch {
        if (!alive) return;
        setFriends([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function onDocDown(e) {
      if (!menuOpenId) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setMenuOpenId(null);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [menuOpenId]);

  const openChat = (f) => {
    window.dispatchEvent(
      new CustomEvent("gm:chat:open", {
        detail: { user: { id: f.id, name: f.name, avatar: f.avatar } },
      })
    );
  };

  const doUnfriend = async (f) => {
    const ok = await confirm(`Hủy kết bạn với ${f.name}?`);
    if (!ok) return;
    try {
      await unfriendApi(f.id);
      setFriends((prev) => prev.filter((x) => x.id !== f.id));
    } finally {
      setMenuOpenId(null);
    }
  };

  const doBlock = async (f) => {
    const ok = await confirm(`Chặn ${f.name}? Bạn sẽ không thấy nhau trong danh sách bạn bè.`);
    if (!ok) return;
    try {
      await blockUserApi(f.id);
      setFriends((prev) => prev.filter((x) => x.id !== f.id));
    } finally {
      setMenuOpenId(null);
    }
  };

  return (
    <div className={styles.page}>
      {embedded ? null : <Header />}
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${tab === "all" ? styles.tabActive : ""}`}
                  onClick={() => setTab("all")}
                >
                  Bạn bè
                </button>
                <button
                  className={`${styles.tab} ${tab === "recent" ? styles.tabActive : ""}`}
                  onClick={() => setTab("recent")}
                >
                  Đã thêm gần đây
                </button>
              </div>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.sectionTitle}>
                {tab === "all" ? "Bạn bè" : "Đã thêm gần đây"}
              </div>
              <div className={styles.list}>
                {loading ? (
                  <div className={styles.row}>Đang tải...</div>
                ) : data.length === 0 ? (
                  <div className={styles.row}>Chưa có bạn bè.</div>
                ) : (
                  data.map((f) => (
                    <div
                      key={f.id}
                      className={styles.row}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/u/${encodeURIComponent(f.id || "")}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/u/${encodeURIComponent(f.id || "")}`);
                        }
                      }}
                    >
                      {f.avatar ? (
                        <img src={f.avatar} alt="" className={styles.avatar} />
                      ) : (
                        <div className={styles.avatarFallback} aria-hidden="true">
                          {initialsFromName(f.name)}
                        </div>
                      )}
                      <div className={styles.nameMeta}>
                        <div className={styles.name}>{f.name}</div>
                        <div className={styles.meta}>{f.mutual} bạn chung</div>
                      </div>
                      <div className={styles.actions}>
                        <button
                          className={styles.messageBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            openChat(f);
                          }}
                        >
                          Nhắn tin
                        </button>
                        <div className={styles.menuWrap} ref={menuOpenId === f.id ? menuRef : null}>
                          <button
                            className={styles.menuBtn}
                            aria-label="Tùy chọn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId((cur) => (cur === f.id ? null : f.id));
                            }}
                          >
                            <FaEllipsisH />
                          </button>
                          {menuOpenId === f.id ? (
                            <div className={styles.menu}>
                              <button
                                className={styles.menuItemDanger}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  doUnfriend(f);
                                }}
                              >
                                Hủy kết bạn
                              </button>
                              <button
                                className={styles.menuItemDanger}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  doBlock(f);
                                }}
                              >
                                Chặn
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      {embedded ? null : <Footer />}
    </div>
  );
}

