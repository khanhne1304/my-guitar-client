import { useEffect, useMemo, useState } from "react";
import styles from "./RightSidebar.module.css";
import { apiClient } from "../../../../services/apiClient";
import { getPresenceSocket } from "../../../../services/presenceSocket";

export default function RightSidebar() {
  const [friends, setFriends] = useState([]);
  const [onlineIds, setOnlineIds] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiClient.get("/users/friends");
        if (!mounted) return;
        setFriends(Array.isArray(data) ? data : []);
      } catch {
        if (!mounted) return;
        setFriends([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = getPresenceSocket();
    const onOnlineUsers = (payload) => {
      const ids = payload?.onlineUserIds;
      setOnlineIds(Array.isArray(ids) ? ids : []);
    };
    socket.on("presence:onlineUsers", onOnlineUsers);
    return () => {
      socket.off("presence:onlineUsers", onOnlineUsers);
    };
  }, []);

  const active = useMemo(() => {
    const set = new Set((onlineIds || []).map(String));
    return (friends || []).filter((f) => set.has(String(f?._id || f?.id)));
  }, [friends, onlineIds]);

  return (
    <aside className={styles._card}>
      <div className={styles._title}>Bạn bè đang hoạt động</div>
      <div className={styles._list}>
        {active.length === 0 ? (
          <div className={styles._empty}>Chưa có bạn bè nào đang online.</div>
        ) : active.map((c) => (
          <div key={c._id || c.id} className={styles._row}>
            <div className={styles._avatar}>
              {c.avatarUrl ? (
                <img className={styles._avatarImg} src={c.avatarUrl} alt="" />
              ) : null}
              <span className={styles._onlineDot} />
            </div>
            <span>{c.fullName || c.username || "Bạn bè"}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

