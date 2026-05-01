import { useEffect, useMemo, useState } from "react";
import styles from "./ForumReportManager.module.css";
import PostCard from "../../forum/PostCard/PostCard";
import { useNavigate } from "react-router-dom";

function resolvePostSnapshot(v) {
  // Ưu tiên lấy nội dung thật từ localStorage 'user_posts' nếu trùng postId
  try {
    const raw = localStorage.getItem("user_posts");
    const arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr) && v?.postId) {
      const match = arr.find((p) => p.id === v.postId);
      if (match) {
        return {
          id: match.id,
          authorName: match.authorName || v?.snapshot?.authorName || v?.authorName || "Người dùng",
          authorAvatarUrl: match.authorAvatarUrl || v?.snapshot?.authorAvatarUrl || "",
          time: match.time || v?.snapshot?.time || "",
          content: match.content || v?.snapshot?.content || "",
          imageUrl: match.imageUrl || v?.snapshot?.imageUrl || "",
        };
      }
    }
  } catch {}
  // Fallback dùng snapshot đã lưu trong reported_posts
  return {
    id: v?.postId,
    authorName: v?.snapshot?.authorName || v?.authorName || "Người dùng",
    authorAvatarUrl: v?.snapshot?.authorAvatarUrl || "",
    time: v?.snapshot?.time || "",
    content: v?.snapshot?.content || "",
    imageUrl: v?.snapshot?.imageUrl || "",
  };
}

export default function ForumReportManager() {
  const [reports, setReports] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);
  const navigate = useNavigate();

  function load() {
    try {
      const raw = localStorage.getItem("reported_posts");
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) {
        setReports(arr);
      } else {
        setReports([]);
      }
    } catch {
      setReports([]);
    }
  }

  useEffect(() => {
    load();
    const onChanged = () => load();
    window.addEventListener("forum:reports-updated", onChanged);
    return () => window.removeEventListener("forum:reports-updated", onChanged);
  }, []);

  const sorted = useMemo(
    () => reports.slice().sort((a, b) => (b.count || 0) - (a.count || 0)),
    [reports]
  );

  function viewReport(r) {
    if (r?.postId) {
      navigate(`/forum/post/${encodeURIComponent(r.postId)}`);
      return;
    }
    // Fallback: open inline modal if no id
    setViewing(r);
  }

  function viewDetails(r) {
    setViewingDetails(r);
  }

  function deletePost(r) {
    if (!window.confirm("Xoá bài viết này? Bài sẽ ẩn khỏi bảng tin.")) return;
    try {
      // 1) Nếu bài thuộc user_posts thì xóa khỏi đó
      const raw = localStorage.getItem("user_posts");
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr) && arr.length) {
        const after = arr.filter((p) => p.id !== r.postId);
        localStorage.setItem("user_posts", JSON.stringify(after));
        try { window.dispatchEvent(new Event("user:post-changed")); } catch {}
      }
      // 2) Thêm vào danh sách muted_posts để ẩn cả bài demo
      const mutedRaw = localStorage.getItem("muted_posts");
      const muted = mutedRaw ? JSON.parse(mutedRaw) : [];
      if (!muted.includes(r.postId)) {
        muted.push(r.postId);
        localStorage.setItem("muted_posts", JSON.stringify(muted));
        try { window.dispatchEvent(new Event("forum:muted-changed")); } catch {}
      }
      // 3) Xóa khỏi danh sách báo cáo
      const left = reports.filter((x) => x.postId !== r.postId);
      localStorage.setItem("reported_posts", JSON.stringify(left));
      setReports(left);
    } catch {}
  }

  return (
    <div className={styles._page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Báo cáo diễn đàn</h1>
        </div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Danh sách bài viết bị báo cáo</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Bài viết</th>
                  <th>Lần báo cáo</th>
                  <th>Gần nhất</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length > 0 ? (
                  sorted.map((r) => {
                    const snap = resolvePostSnapshot(r);
                    return (
                    <tr key={r.postId}>
                      <td>
                        <div className={styles.postCell}>
                          {r?.snapshot?.authorAvatarUrl ? (
                            <img className={styles._avatar} src={r.snapshot.authorAvatarUrl} alt="" />
                          ) : <div className={styles._avatar} />}
                          <div>
                            <div className={styles._name}>{r.snapshot?.authorName || r.authorName || "Người dùng"}</div>
                            {snap?.content ? <div className={styles._preview}>{snap.content}</div> : null}
                          </div>
                        </div>
                      </td>
                      <td><span className={styles.countBadge}>{r.count}</span></td>
                      <td>{r.lastReportedAt ? new Date(r.lastReportedAt).toLocaleString("vi-VN") : "-"}</td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.btn} onClick={() => viewReport(r)}>Xem bài viết</button>
                          <button className={styles.btn} onClick={() => viewDetails(r)}>Xem chi tiết</button>
                          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => deletePost(r)}>Xoá bài viết</button>
                        </div>
                      </td>
                    </tr>
                  )})
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.empty}>Chưa có bài viết nào bị báo cáo.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewing && (
        <div className={styles._modalBackdrop} onClick={() => setViewing(null)}>
          <div className={styles._modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles._modalHead}>
              <div className={styles.title}>Bài viết bị báo cáo</div>
              <button className={styles.btn} onClick={() => setViewing(null)}>Đóng</button>
            </div>
            <div className={styles._modalBody}>
              <PostCard post={resolvePostSnapshot(viewing)} />
            </div>
          </div>
        </div>
      )}

      {viewingDetails && (
        <div className={styles._modalBackdrop} onClick={() => setViewingDetails(null)}>
          <div className={styles._modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles._modalHead}>
              <div className={styles.title}>Chi tiết báo cáo</div>
              <button className={styles.btn} onClick={() => setViewingDetails(null)}>Đóng</button>
            </div>
            <div className={styles._modalBody}>
              <div className={styles.sectionTitle} style={{marginTop:0}}>Bài viết</div>
              <div className={styles._postHeader}>
                {viewingDetails?.snapshot?.authorAvatarUrl ? (
                  <img className={styles._postAvatar} src={viewingDetails.snapshot.authorAvatarUrl} alt="" />
                ) : <div className={styles._postAvatar} />}
                <div>
                  <div className={styles._postName}>{viewingDetails?.snapshot?.authorName || viewingDetails?.authorName || "Người dùng"}</div>
                  <div className={styles._postTime}>{viewingDetails?.snapshot?.time || ""}</div>
                </div>
              </div>
              <div className={styles.sectionTitle}>Danh sách người báo cáo</div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên người báo cáo</th>
                      <th>Lý do báo cáo</th>
                      <th>Thời gian báo cáo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewingDetails.reports || []).map((rp, idx) => (
                      <tr key={rp.id || idx}>
                        <td>{idx + 1}</td>
                        <td>{rp.reporterName || "Ẩn danh"}</td>
                        <td>{rp.reason}</td>
                        <td>{rp.at ? new Date(rp.at).toLocaleString("vi-VN") : ""}</td>
                      </tr>
                    ))}
                    {(!viewingDetails.reports || viewingDetails.reports.length === 0) && (
                      <tr><td colSpan="4" className={styles.empty}>Chưa có chi tiết người báo cáo.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

