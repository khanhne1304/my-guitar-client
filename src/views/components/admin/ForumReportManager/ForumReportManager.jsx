import { useEffect, useMemo, useState } from "react";
import styles from "./ForumReportManager.module.css";
import { useNavigate } from "react-router-dom";
import { forumApi } from "../../../../services/forumApi";

export default function ForumReportManager() {
  const [reports, setReports] = useState([]);
  const [viewingDetails, setViewingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await forumApi.listReports();
        if (!alive) return;
        setReports(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setReports([]);
        setError(e?.message || "Không thể tải báo cáo.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    (reports || []).forEach((r) => {
      const tid = String(r?.thread?._id || r?.thread || "");
      if (!tid) return;
      const cur = map.get(tid) || { thread: r.thread, items: [], count: 0, lastReportedAt: 0 };
      cur.items.push(r);
      cur.count += 1;
      cur.lastReportedAt = Math.max(cur.lastReportedAt, new Date(r?.createdAt || 0).getTime());
      map.set(tid, cur);
    });
    return Array.from(map.values()).sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [reports]);

  function viewReport(g) {
    const tid = g?.thread?._id || g?.thread;
    if (!tid) return;
    navigate(`/forum/thread/${encodeURIComponent(tid)}`);
  }

  function viewDetails(g) {
    setViewingDetails(g);
  }

  async function deleteThread(g) {
    const tid = g?.thread?._id || g?.thread;
    if (!tid) return;
    if (!window.confirm("Xoá chủ đề này?")) return;
    try {
      await forumApi.deleteThread(String(tid));
      setReports((prev) => (prev || []).filter((r) => String(r?.thread?._id || r?.thread) !== String(tid)));
    } catch {
      // ignore
    }
  }

  return (
    <div className={styles._page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Báo cáo diễn đàn</h1>
        </div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Danh sách chủ đề bị báo cáo</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Chủ đề</th>
                  <th>Lần báo cáo</th>
                  <th>Gần nhất</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {error ? (
                  <tr>
                    <td colSpan="4" className={styles.empty}>{error}</td>
                  </tr>
                ) : loading ? (
                  <tr>
                    <td colSpan="4" className={styles.empty}>Đang tải...</td>
                  </tr>
                ) : grouped.length > 0 ? (
                  grouped.map((g) => {
                    const tid = g?.thread?._id || g?.thread;
                    return (
                    <tr key={String(tid)}>
                      <td>
                        <div className={styles.postCell}>
                          <div>
                            <div className={styles._name}>{g?.thread?.title || "Chủ đề"}</div>
                            <div className={styles._preview}>{g?.thread?.category} • {g?.thread?.type}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={styles.countBadge}>{g.count}</span></td>
                      <td>{g.lastReportedAt ? new Date(g.lastReportedAt).toLocaleString("vi-VN") : "-"}</td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.btn} onClick={() => viewReport(g)}>Xem chủ đề</button>
                          <button className={styles.btn} onClick={() => viewDetails(g)}>Xem chi tiết</button>
                          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => deleteThread(g)}>Xoá chủ đề</button>
                        </div>
                      </td>
                    </tr>
                  )})
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.empty}>Chưa có chủ đề nào bị báo cáo.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewingDetails && (
        <div className={styles._modalBackdrop} onClick={() => setViewingDetails(null)}>
          <div className={styles._modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles._modalHead}>
              <div className={styles.title}>Chi tiết báo cáo</div>
              <button className={styles.btn} onClick={() => setViewingDetails(null)}>Đóng</button>
            </div>
            <div className={styles._modalBody}>
              <div className={styles.sectionTitle} style={{marginTop:0}}>Chủ đề</div>
              <div className={styles._postHeader}>
                <div>
                  <div className={styles._postName}>{viewingDetails?.thread?.title || "Chủ đề"}</div>
                  <div className={styles._postTime}>{viewingDetails?.thread?.category} • {viewingDetails?.thread?.type}</div>
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
                    {(viewingDetails.items || []).map((rp, idx) => (
                      <tr key={rp._id || idx}>
                        <td>{idx + 1}</td>
                        <td>{rp?.reportedBy?.fullName || rp?.reportedBy?.username || "Ẩn danh"}</td>
                        <td>{rp?.reason}</td>
                        <td>{rp?.createdAt ? new Date(rp.createdAt).toLocaleString("vi-VN") : ""}</td>
                      </tr>
                    ))}
                    {(!viewingDetails.items || viewingDetails.items.length === 0) && (
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

