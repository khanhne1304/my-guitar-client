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
      let arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr) || arr.length === 0) {
        // seed sample reported posts
        const now = Date.now();
        arr = [
          {
            postId: "rp-seed-1",
            authorId: "u_seed_12",
            authorName: "Ngọc Mai",
            count: 7,
            reasons: ["Nội dung người lớn", "Bạo lực"],
            reports: [
              { id: "r1", reporterName: "Khoa Lê", reporterId: "f2", reason: "Nội dung người lớn", note: "", at: now - 70*60*1000 },
              { id: "r2", reporterName: "Bình Nhi", reporterId: "f9", reason: "Bạo lực", note: "", at: now - 62*60*1000 },
            ],
            lastReportedAt: now - 60 * 60 * 1000,
            snapshot: {
              authorName: "Ngọc Mai",
              authorAvatarUrl: "https://i.pravatar.cc/80?img=12",
              time: "2 giờ trước",
              content: "Mọi người có gợi ý gì để tập legato mượt hơn không? Mình đang theo bài 1-2-3-4 nhưng chưa đều tay.",
              imageUrl: "",
            },
          },
          {
            postId: "rp-seed-2",
            authorId: "u_seed_05",
            authorName: "Thanh Tùng",
            count: 3,
            reasons: ["Thông tin sai sự thật", "Spam"],
            reports: [
              { id: "r3", reporterName: "Ngọc Mai", reporterId: "f1", reason: "Thông tin sai sự thật", note: "", at: now - 2.5*60*60*1000 },
              { id: "r4", reporterName: "Laam Ly", reporterId: "f4", reason: "Spam", note: "", at: now - 2*60*60*1000 },
            ],
            lastReportedAt: now - 2 * 60 * 60 * 1000,
            snapshot: {
              authorName: "Thanh Tùng",
              authorAvatarUrl: "https://i.pravatar.cc/80?img=5",
              time: "Hôm qua",
              content: "Có ai có tab phần điệp khúc bài 'Có chàng trai viết lên cây' không ạ?",
              imageUrl:
                "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1470&auto=format&fit=crop",
            },
          },
          {
            postId: "rp-seed-3",
            authorId: "u_seed_32",
            authorName: "Hà Linh",
            count: 5,
            reasons: ["Quấy rối", "Ngôn từ thù ghét"],
            reports: [
              { id: "r5", reporterName: "Đạt Tiên", reporterId: "f8", reason: "Quấy rối", note: "", at: now - 40*60*1000 },
            ],
            lastReportedAt: now - 30 * 60 * 1000,
            snapshot: {
              authorName: "Hà Linh",
              authorAvatarUrl: "https://i.pravatar.cc/80?img=32",
              time: "3 giờ trước",
              content: "Một số bình luận có thể gây khó chịu.",
              imageUrl: "",
            },
          },
        ];
        localStorage.setItem("reported_posts", JSON.stringify(arr));
      }

      // Ensure each report item has mock 'reports' details if missing
      const sampleReporters = [
        "Khoa Lê",
        "Bình Nhi",
        "Laam Ly",
        "Minh Thi",
        "Nguyệt Anh",
        "Đạt Tiên",
      ];
      const now2 = Date.now();
      let mutated = false;
      arr.forEach((r, i) => {
        if (!Array.isArray(r.reports) || r.reports.length === 0) {
          const reasons = Array.isArray(r.reasons) && r.reasons.length ? r.reasons : ["Nội dung không phù hợp"];
          r.reports = [
            {
              id: `auto-r${i}-1`,
              reporterName: sampleReporters[i % sampleReporters.length],
              reporterId: `seed-${i}`,
              reason: reasons[0],
              note: "",
              at: now2 - (i + 1) * 35 * 60 * 1000,
            },
            {
              id: `auto-r${i}-2`,
              reporterName: sampleReporters[(i + 2) % sampleReporters.length],
              reporterId: `seed-${i}-b`,
              reason: reasons[1] || reasons[0],
              note: "",
              at: now2 - (i + 1) * 20 * 60 * 1000,
            },
          ];
          // update count/lastReportedAt for consistency
          r.count = Math.max(r.count || 0, r.reports.length);
          r.lastReportedAt = r.reports.reduce((m, x) => Math.max(m, x.at || 0), 0);
          mutated = true;
        }
      });
      if (mutated) {
        localStorage.setItem("reported_posts", JSON.stringify(arr));
      }

      // Migration: fix old seed contents that had "..." truncated text
      const seedContentMap = {
        "rp-seed-1":
          "Mọi người có gợi ý gì để tập legato mượt hơn không? Mình đang theo bài 1-2-3-4 nhưng chưa đều tay.",
        "rp-seed-2":
          "Chia sẻ góc tập mới của mình và preset reverb/delay đang dùng.",
        "rp-seed-3":
          "Một số bình luận có thể gây khó chịu.",
      };
      let migratedContent = false;
      arr.forEach((r) => {
        const desired = seedContentMap[r.postId];
        if (desired && r?.snapshot?.content && /(\.\.\.|…)$/.test(r.snapshot.content)) {
          r.snapshot.content = desired;
          migratedContent = true;
        }
      });
      if (migratedContent) {
        localStorage.setItem("reported_posts", JSON.stringify(arr));
      }

      setReports(arr);
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

