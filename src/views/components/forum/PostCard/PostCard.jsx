import { useRef, useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaRegThumbsUp, FaRegComment, FaShare, FaEllipsisH, FaThumbsUp, FaLaugh, FaHeart, FaAngry } from "react-icons/fa";
import styles from "./PostCard.module.css";
import ComposeModal from "../ComposerModal/ComposeModal";

export default function PostCard({ post }) {
  const [showPicker, setShowPicker] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [reaction, setReaction] = useState(null); // 'like' | 'haha' | 'love' | 'angry'
  const [showMenu, setShowMenu] = useState(false);
  const wrapRef = useRef(null);
  const [hideTimer, setHideTimer] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editContent, setEditContent] = useState(post?.content || "");
  const [editImages, setEditImages] = useState(post?.imageUrl ? [post.imageUrl] : []);
  const fileRef = useRef(null);
  const [openReport, setOpenReport] = useState(false);
  const [openReportDone, setOpenReportDone] = useState(false);
  const [blockedSet, setBlockedSet] = useState(new Set());
  const [mutedSet, setMutedSet] = useState(new Set());
  const [userReaction, setUserReaction] = useState(null); // 'like' | 'love' | 'haha' | 'angry' | null
  const [counts, setCounts] = useState({ like: 0, love: 0, haha: 0, angry: 0 });
  const [openDetail, setOpenDetail] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentLikeMap, setCommentLikeMap] = useState({}); // { [key]: { liked: bool, count: number } }
  const [replyOpenFor, setReplyOpenFor] = useState(null); // commentId or null
  const [replyText, setReplyText] = useState("");
  const [newComment, setNewComment] = useState("");
  const commentsRef = useRef(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("user");
        setCurrentUser(raw ? JSON.parse(raw) : null);
      } catch {}
    };
    loadUser();
    const onProfileChanged = () => loadUser();
    window.addEventListener("user:profile-changed", onProfileChanged);
    // Also react to localStorage updates across tabs/windows
    const onStorage = (e) => {
      if (e?.key === "user") loadUser();
    };
    window.addEventListener("storage", onStorage);

    // load blocked
    const loadBlocked = () => {
      try {
        const raw = localStorage.getItem("blocked_users");
        const arr = raw ? JSON.parse(raw) : [];
        setBlockedSet(new Set(Array.isArray(arr) ? arr : []));
      } catch { setBlockedSet(new Set()); }
    };
    loadBlocked();
    const onBlockedChanged = () => loadBlocked();
    window.addEventListener("forum:blocked-changed", onBlockedChanged);
    // load muted posts
    const loadMuted = () => {
      try {
        const raw = localStorage.getItem("muted_posts");
        const arr = raw ? JSON.parse(raw) : [];
        setMutedSet(new Set(Array.isArray(arr) ? arr : []));
      } catch { setMutedSet(new Set()); }
    };
    loadMuted();
    const onMutedChanged = () => loadMuted();
    window.addEventListener("forum:muted-changed", onMutedChanged);
    return () => {
      window.removeEventListener("user:profile-changed", onProfileChanged);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("forum:blocked-changed", onBlockedChanged);
      window.removeEventListener("forum:muted-changed", onMutedChanged);
    };
  }, []);

  // Reactions: load hoặc khởi tạo trống (không seed dữ liệu giả)
  useEffect(() => {
    if (!post?.id) return;
    try {
      const key = "post_reactions";
      const raw = localStorage.getItem(key);
      const map = raw ? JSON.parse(raw) : {};
      if (map[post.id]) {
        const rec = map[post.id];
        setCounts(rec.counts || { like: 0, love: 0, haha: 0, angry: 0 });
        setUserReaction(rec.userReaction ?? null);
        setReaction(rec.userReaction ?? null);
      } else {
        const cnts = { like: 0, love: 0, haha: 0, angry: 0 };
        setCounts(cnts);
        const rec = { counts: cnts, userReaction: null };
        localStorage.setItem(key, JSON.stringify({ ...map, [post.id]: rec }));
        setReaction(null);
      }
    } catch {}
  }, [post?.id]);

  // Comments: chỉ load từ localStorage, không seed dữ liệu giả
  useEffect(() => {
    if (!post?.id) return;
    try {
      const key = "post_comments";
      const raw = localStorage.getItem(key);
      const map = raw ? JSON.parse(raw) : {};
      if (Array.isArray(map[post.id])) {
        setComments(map[post.id]);
      } else {
        setComments([]);
      }
    } catch {}
  }, [post?.id]);

  // Khởi tạo map like cho bình luận (mặc định 0, không seed random)
  useEffect(() => {
    if (!post?.id || comments.length === 0) return;
    try {
      const key = "comment_reactions";
      const raw = localStorage.getItem(key);
      const map = raw ? JSON.parse(raw) : {};
      const next = { ...map };
      let changed = false;
      comments.forEach((c, idx) => {
        const k = `${post.id}:${c.id}`;
        if (!next[k]) {
          next[k] = { liked: false, count: 0 };
          changed = true;
        }
      });
      if (changed) localStorage.setItem(key, JSON.stringify(next));
      setCommentLikeMap(next);
    } catch {}
  }, [post?.id, comments]);

  function toggleCommentLike(c) {
    try {
      const key = "comment_reactions";
      const raw = localStorage.getItem(key);
      const map = raw ? JSON.parse(raw) : {};
      const k = `${post.id}:${c.id}`;
      const cur = map[k] || { liked: false, count: 0 };
      const next = { ...cur };
      if (next.liked) {
        next.liked = false;
        next.count = Math.max(0, (next.count || 0) - 1);
      } else {
        next.liked = true;
        next.count = (next.count || 0) + 1;
      }
      const updated = { ...map, [k]: next };
      localStorage.setItem(key, JSON.stringify(updated));
      setCommentLikeMap(updated);
    } catch {}
  }

  function submitReply(c) {
    if (!replyText.trim()) return;
    // For this mock, we just close the editor; not persisting replies
    setReplyText("");
    setReplyOpenFor(null);
  }

  function submitNewComment() {
    const text = newComment.trim();
    if (!text || !post?.id) return;
    const userName = currentUser?.fullName || currentUser?.username || "Tôi";
    const userAvatar = currentUser?.avatarUrl || "";
    const nowStr = new Date().toLocaleString("vi-VN", { hour12: false });
    const newItem = {
      id: `c-${post.id}-${Date.now()}`,
      authorName: userName,
      authorAvatarUrl: userAvatar,
      text,
      time: nowStr,
    };
    try {
      const key = "post_comments";
      const raw = localStorage.getItem(key);
      const map = raw ? JSON.parse(raw) : {};
      const arr = Array.isArray(map[post.id]) ? map[post.id] : [];
      const updated = [...arr, newItem];
      localStorage.setItem(key, JSON.stringify({ ...map, [post.id]: updated }));
      setComments(updated);
      setNewComment("");
      // scroll to bottom
      setTimeout(() => {
        try {
          commentsRef.current?.scrollTo?.({ top: commentsRef.current.scrollHeight, behavior: "smooth" });
        } catch {}
      }, 0);
    } catch {}
  }

  function onNewCommentKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitNewComment();
    }
  }

  const startHover = () => {
    clearTimeout(hoverTimer || undefined);
    clearTimeout(hideTimer || undefined);
    const t = setTimeout(() => setShowPicker(true), 500);
    setHoverTimer(t);
  };
  const endHover = () => {
    clearTimeout(hoverTimer || undefined);
    setHoverTimer(null);
    clearTimeout(hideTimer || undefined);
    const t = setTimeout(() => setShowPicker(false), 350); // trễ đóng để dễ chọn
    setHideTimer(t);
  };
  const choose = (type) => {
    // update UI label
    setReaction(type);
    setShowPicker(false);
    if (!post?.id) return;
    try {
      const key = "post_reactions";
      const raw = localStorage.getItem(key);
      const map = raw ? JSON.parse(raw) : {};
      const rec = map[post.id] || { counts: { like: 0, love: 0, haha: 0, angry: 0 }, userReaction: null };
      const next = { ...rec };
      // remove previous reaction if any
      if (next.userReaction && next.counts[next.userReaction] > 0) {
        next.counts[next.userReaction] -= 1;
      }
      // apply new reaction if provided
      if (type) {
        next.counts[type] = (next.counts[type] || 0) + 1;
        next.userReaction = type;
      } else {
        next.userReaction = null;
      }
      setCounts({ ...next.counts });
      setUserReaction(next.userReaction);
      localStorage.setItem(key, JSON.stringify({ ...map, [post.id]: next }));
    } catch {}
  };

  const label =
    reaction === "haha" ? "Haha" :
    reaction === "love" ? "Yêu thích" :
    reaction === "angry" ? "Phẫn nộ" :
    "Thích";

  const icon =
    reaction === "haha" ? <FaLaugh color="#f59e0b" /> :
    reaction === "love" ? <FaHeart color="#ef4444" /> :
    reaction === "angry" ? <FaAngry color="#b91c1c" /> :
    reaction === "like" ? <FaThumbsUp color="#2563eb" /> :
    <FaRegThumbsUp />;

  const totalReactions = useMemo(
    () => (counts.like || 0) + (counts.love || 0) + (counts.haha || 0) + (counts.angry || 0),
    [counts]
  );
  const topReactions = useMemo(() => {
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => k);
  }, [counts]);

  const isOwner = (() => {
    if (!currentUser) return false;
    const uid = currentUser.id || currentUser._id || currentUser.userId;
    if (post?.authorId && uid) return post.authorId === uid;
    const name = currentUser.fullName || currentUser.username;
    return !!name && post?.authorName === name;
  })();

  const displayAuthorAvatarUrl = (isOwner ? (currentUser?.avatarUrl || "") : (post?.authorAvatarUrl || ""));

  const authorKey = post?.authorId || post?.authorName || "";
  const isBlockedAuthor = authorKey ? blockedSet.has(authorKey) : false;
  if (isBlockedAuthor) return null;
  if (post?.id && mutedSet.has(post.id)) return null;

  const onPickImagesEdit = () => fileRef.current?.click();
  const onFilesEdit = async (files) => {
    if (!files?.length) return;
    const toDataUrl = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    const urls = [];
    for (const f of Array.from(files)) {
      try {
        if (!/^image\//.test(f.type)) continue;
        if (f.size > 5 * 1024 * 1024) continue;
        // eslint-disable-next-line no-await-in-loop
        const dataUrl = await toDataUrl(f);
        urls.push(dataUrl);
      } catch {}
    }
    if (urls.length) setEditImages((prev) => [...prev, ...urls]);
  };

  const onEditSubmit = () => {
    try {
      const raw = localStorage.getItem("user_posts");
      const arr = raw ? JSON.parse(raw) : [];
      const uid = currentUser?.id || currentUser?._id || currentUser?.userId;
      const latestAvatar = currentUser?.avatarUrl || "";
      const updated = arr.map((p) =>
        p.id === post.id
          ? {
              ...p,
              content: editContent,
              imageUrl: editImages?.[0] || "",
              authorId: p.authorId || uid,
              // keep snapshot in sync for places still reading from post object
              authorAvatarUrl: latestAvatar || p.authorAvatarUrl || "",
            }
          : p
      );
      localStorage.setItem("user_posts", JSON.stringify(updated));
      try {
        window.dispatchEvent(new Event("user:post-changed"));
      } catch {}
    } catch {}
    setOpenEdit(false);
    setShowMenu(false);
  };

  const onDelete = () => {
    if (!window.confirm("Bạn có chắc muốn xoá bài viết này?")) return;
    try {
      const raw = localStorage.getItem("user_posts");
      const arr = raw ? JSON.parse(raw) : [];
      const filtered = arr.filter((p) => p.id !== post.id);
      localStorage.setItem("user_posts", JSON.stringify(filtered));
      try {
        window.dispatchEvent(new Event("user:post-changed"));
      } catch {}
    } catch {}
    setShowMenu(false);
  };

  function onChooseReportReason(reason) {
    // increase report count in localStorage
    try {
      const key = "reported_posts";
      const raw = localStorage.getItem(key);
      const arr = Array.isArray(raw ? JSON.parse(raw) : []) ? JSON.parse(raw) : [];
      const idx = arr.findIndex((r) => r.postId === post.id);
      const reporterName = (() => {
        try {
          const ru = localStorage.getItem("user");
          const u = ru ? JSON.parse(ru) : null;
          return u?.fullName || u?.username || "Ẩn danh";
        } catch { return "Ẩn danh"; }
      })();
      const reporterId = (() => {
        try {
          const ru = localStorage.getItem("user");
          const u = ru ? JSON.parse(ru) : null;
          return u?.id || u?._id || u?.userId || "";
        } catch { return ""; }
      })();
      const reportEntry = {
        id: `rep-${Date.now()}`,
        reporterId,
        reporterName,
        reason,
        note: "",
        at: Date.now(),
      };
      const base = {
        postId: post.id,
        authorId: post.authorId || "",
        authorName: post.authorName || "",
        count: 0,
        reasons: [],
        reports: [],
        lastReportedAt: 0,
        snapshot: {
          authorName: post.authorName,
          authorAvatarUrl: post.authorAvatarUrl,
          time: post.time,
          content: post.content,
          imageUrl: post.imageUrl || "",
        },
      };
      if (idx >= 0) {
        const cur = arr[idx];
        cur.count = (cur.count || 0) + 1;
        cur.reasons = Array.isArray(cur.reasons) ? [...cur.reasons, reason] : [reason];
        cur.reports = Array.isArray(cur.reports) ? [...cur.reports, reportEntry] : [reportEntry];
        cur.lastReportedAt = Date.now();
        arr[idx] = cur;
      } else {
        base.count = 1;
        base.reasons = [reason];
        base.reports = [reportEntry];
        base.lastReportedAt = Date.now();
        arr.push(base);
      }
      localStorage.setItem(key, JSON.stringify(arr));
      try { window.dispatchEvent(new Event("forum:reports-updated")); } catch {}
    } catch {}
    setOpenReport(false);
    setOpenReportDone(true);
  }

  function blockAuthor() {
    try {
      const raw = localStorage.getItem("blocked_users");
      const arr = raw ? JSON.parse(raw) : [];
      const key = authorKey;
      if (key && !arr.includes(key)) {
        arr.push(key);
        localStorage.setItem("blocked_users", JSON.stringify(arr));
      }
      try { window.dispatchEvent(new Event("forum:blocked-changed")); } catch {}
    } catch {}
    setOpenReportDone(false);
  }

  return (
    <article className={styles._card}>
      <header className={styles._header}>
        {displayAuthorAvatarUrl ? (
          <Link to={`/u/${encodeURIComponent(post.authorId || post.authorName || "")}`} aria-label={post.authorName}>
            <img className={styles._avatarImg} src={displayAuthorAvatarUrl} alt="" />
          </Link>
        ) : (
          <Link to={`/u/${encodeURIComponent(post.authorId || post.authorName || "")}`} aria-label={post.authorName}>
            <div className={styles._avatar} />
          </Link>
        )}
        <div className={styles._meta}>
          <Link className={styles._nameLink} to={`/u/${encodeURIComponent(post.authorId || post.authorName || "")}`}>
            <span className={styles._name}>{post.authorName}</span>
          </Link>
          <span className={styles._time}>{post.time}</span>
        </div>
        <button className={styles._moreBtn} onClick={() => setShowMenu((v) => !v)} aria-label="Tùy chọn">
          <FaEllipsisH />
        </button>
        {showMenu && (
          <div className={styles._menu} onMouseLeave={() => setShowMenu(false)}>
            {isOwner ? (
              <>
                <div className={styles._menuItem} onClick={() => { setEditContent(post.content || ""); setEditImages(post.imageUrl ? [post.imageUrl] : []); setOpenEdit(true); }}>
                  Chỉnh sửa bài viết
                </div>
                <div className={styles._menuItem} onClick={onDelete}>
                  Xoá bài viết
                </div>
              </>
            ) : (
              <>
                <div className={styles._menuItem}>Chặn {post.authorName}</div>
                <div className={styles._menuItem} onClick={() => { setOpenReport(true); setShowMenu(false); }}>
                  Báo cáo bài viết
                </div>
              </>
            )}
          </div>
        )}
      </header>
      {post.content && <div className={styles._content}>{post.content}</div>}
      {post.imageUrl && !post.videoUrl && (
        <img className={styles._image} src={post.imageUrl} alt="" onClick={() => setOpenDetail(true)} />
      )}
      {post.videoUrl && (
        <video
          className={styles._video}
          src={post.videoUrl}
          controls
          playsInline
          preload="metadata"
        />
      )}
      <footer className={styles._footer}>
        {/* Reaction summary above buttons */}
        {(totalReactions > 0) && (
          <div className={styles._summary}>
            <span className={styles._sumIcons}>
              {topReactions.map((t, idx) => (
                <span
                  key={t}
                  className={`${styles._sumIcon} ${styles[`_sum_${t}`]}`}
                  style={{ zIndex: 3 - idx }}
                >
                  {t === "like" ? <FaThumbsUp /> : t === "love" ? <FaHeart /> : t === "haha" ? <FaLaugh /> : <FaAngry />}
                </span>
              ))}
            </span>
            <span className={styles._sumText}>
              {userReaction ? (
                totalReactions > 1 ? `Bạn và ${totalReactions - 1} người khác` : "Bạn"
              ) : (
                `${totalReactions} người`
              )}
            </span>
            <button
              type="button"
              className={styles._sumCmtRight}
              onClick={() => setOpenDetail(true)}
              title="Xem bình luận"
            >
              {comments.length} bình luận
            </button>
          </div>
        )}
        <div className={styles._actions}>
          <div
            className={`${styles._reactWrap} ${styles._cellLeft}`}
            onMouseEnter={startHover}
            onMouseLeave={endHover}
            ref={wrapRef}
          >
            <button
              className={`${styles._btn} ${userReaction === "like" ? styles._btnLiked : ""}`}
              onClick={() => choose(userReaction === "like" ? null : "like")}
              aria-pressed={userReaction ? "true" : "false"}
            >
              {icon} {label}
            </button>
            {showPicker && (
              <div
                className={styles._picker}
                onMouseEnter={() => {
                  clearTimeout(hideTimer || undefined);
                }}
                onMouseLeave={endHover}
              >
                <button className={styles._reactIcon} onClick={() => choose("like")} aria-label="Thích"><FaThumbsUp color="#2563eb" /></button>
                <button className={styles._reactIcon} onClick={() => choose("love")} aria-label="Yêu thích"><FaHeart color="#ef4444" /></button>
                <button className={styles._reactIcon} onClick={() => choose("haha")} aria-label="Haha"><FaLaugh color="#f59e0b" /></button>
                <button className={styles._reactIcon} onClick={() => choose("angry")} aria-label="Phẫn nộ"><FaAngry color="#b91c1c" /></button>
              </div>
            )}
          </div>
          <button className={`${styles._btn} ${styles._cellCenter}`} onClick={() => setOpenDetail(true)}><FaRegComment /> Bình luận</button>
          <button className={`${styles._btn} ${styles._cellRight}`}><FaShare /> Chia sẻ</button>
        </div>
      </footer>

      {/* Hidden file input for edit modal */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        multiple={false}
        onChange={(e) => onFilesEdit(e.target.files)}
      />

      {openEdit && (
        <ComposeModal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          content={editContent}
          setContent={setEditContent}
          images={editImages}
          setImages={setEditImages}
          onPickImages={onPickImagesEdit}
          onSubmit={onEditSubmit}
          userAvatarUrl={currentUser?.avatarUrl}
        />
      )}

      {openReport && (
        <div className={styles._rpBackdrop} onClick={() => setOpenReport(false)}>
          <div className={styles._rpModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles._rpHeader}>
              <div className={styles._rpTitle}>Báo cáo</div>
              <button className={styles._rpClose} onClick={() => setOpenReport(false)} aria-label="Đóng">×</button>
            </div>
            <div className={styles._rpBody}>
              <div className={styles._rpHint}>
                Tại sao bạn báo cáo bài viết này?
              </div>
              <ul className={styles._rpList}>
                {[
                  "Vấn đề liên quan đến người dưới 18 tuổi",
                  "Bắt nạt, quấy rối hoặc lang mạ/xúc phạm",
                  "Tự tử hoặc tự gây hại bản thân",
                  "Nội dung mang tính bạo lực, thù ghét hoặc gây phiền toái",
                  "Bán hoặc quảng bá mặt hàng bị hạn chế",
                  "Nội dung người lớn",
                  "Thông tin sai sự thật, lừa đảo hoặc gian lận",
                  "Quyền sở hữu trí tuệ",
                  "Chỉ là tôi không thích nội dung này",
                ].map((txt, idx) => (
                  <li
                    key={idx}
                    className={styles._rpItem}
                    role="button"
                    tabIndex={0}
                    onClick={() => onChooseReportReason(txt)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChooseReportReason(txt);
                      }
                    }}
                  >
                    <span>{txt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {openReportDone && (
        <div className={styles._rpBackdrop} onClick={() => setOpenReportDone(false)}>
          <div className={styles._rpModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles._rpHeader}>
              <div className={styles._rpTitle}>Báo cáo thành công</div>
              <button className={styles._rpClose} onClick={() => setOpenReportDone(false)} aria-label="Đóng">×</button>
            </div>
            <div className={styles._rpBody}>
              <div className={styles._rpSuccessMsg}>
                Quản trị viên đang xem xét về báo cáo của bạn. Cảm ơn bạn vì đóng góp cho cộng đồng.
              </div>
              <div className={styles._rpActions}>
                <button className={styles._rpPrimary} onClick={() => setOpenReportDone(false)}>Xong</button>
                <button className={styles._rpGhost} onClick={blockAuthor}>
                  Chặn {post.authorName}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openDetail && (
        <div className={styles._detailBackdrop} onClick={() => setOpenDetail(false)}>
          <div className={styles._detailModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles._detailHead}>
              <div className={styles._detailTitle}>Bài viết</div>
              <button className={styles._detailClose} onClick={() => setOpenDetail(false)} aria-label="Đóng">×</button>
            </div>
            <div className={styles._detailBody}>
              <div className={styles._detailLeft}>
                {post.videoUrl ? (
                  <video className={styles._detailVideo} src={post.videoUrl} controls playsInline />
                ) : post.imageUrl ? (
                  <img className={styles._detailImage} src={post.imageUrl} alt="" />
                ) : (
                  <div className={styles._detailNoImage}>{post.content}</div>
                )}
              </div>
              <div className={styles._detailRight}>
                <div className={styles._detailPostInfo}>
                  <div className={styles._detailAuthor}>
                    {displayAuthorAvatarUrl ? (
                      <img className={styles._detailAvatar} src={displayAuthorAvatarUrl} alt="" />
                    ) : <div className={styles._detailAvatar} />}
                    <div className={styles._detailMeta}>
                      <strong>{post.authorName}</strong>
                      <span className={styles._detailTime}>{post.time}</span>
                    </div>
                  </div>
                  {post.content ? <div className={styles._detailContent}>{post.content}</div> : null}
                </div>
                <div className={styles._detailCounts}>
                  <div className={styles._summary}>
                    <span className={styles._sumIcons}>
                      {topReactions.map((t, idx) => (
                        <span key={t} className={`${styles._sumIcon} ${styles[`_sum_${t}`]}`} style={{ zIndex: 3 - idx }}>
                          {t === "like" ? <FaThumbsUp /> : t === "love" ? <FaHeart /> : t === "haha" ? <FaLaugh /> : <FaAngry />}
                        </span>
                      ))}
                    </span>
                    <span className={styles._sumText}>
                      {userReaction ? (
                        totalReactions > 1 ? `Bạn và ${totalReactions - 1} người khác` : "Bạn"
                      ) : (
                        `${totalReactions} người`
                      )}
                    </span>
                    <span className={styles._detailCmtCount}>{comments.length} bình luận</span>
                  </div>
                </div>
                <div className={styles._detailComments} ref={commentsRef}>
                  {comments.map((c) => (
                    <div key={c.id} className={styles._cmtRow}>
                      {c.authorAvatarUrl ? (
                        <img className={styles._cmtAvatarImg} src={c.authorAvatarUrl} alt="" />
                      ) : (
                        <div className={styles._cmtAvatar}>{c.authorName?.[0] || "?"}</div>
                      )}
                      <div className={styles._cmtBubble}>
                        <div className={styles._cmtAuthor}>{c.authorName}</div>
                        <div className={styles._cmtText}>{c.text}</div>
                        <div className={styles._cmtMeta}>{c.time}</div>
                        <div className={styles._cmtActions}>
                          <button
                            type="button"
                            className={`${styles._cmtActionBtn} ${commentLikeMap[`${post.id}:${c.id}`]?.liked ? styles._cmtLiked : ""}`}
                            onClick={() => toggleCommentLike(c)}
                          >
                            Thích
                          </button>
                          <span className={styles._cmtDot}>·</span>
                          <button
                            type="button"
                            className={styles._cmtActionBtn}
                            onClick={() => { setReplyOpenFor(c.id); setReplyText(""); }}
                          >
                            Trả lời
                          </button>
                          {typeof commentLikeMap[`${post.id}:${c.id}`]?.count === "number" && commentLikeMap[`${post.id}:${c.id}`]?.count > 0 ? (
                            <span className={styles._cmtLikeCount}>{commentLikeMap[`${post.id}:${c.id}`]?.count}</span>
                          ) : null}
                        </div>
                        {replyOpenFor === c.id && (
                          <div className={styles._replyRow}>
                            <input
                              className={styles._replyInput}
                              placeholder="Viết phản hồi..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <button className={styles._replySend} onClick={() => submitReply(c)}>Gửi</button>
                            <button className={styles._replyCancel} onClick={() => { setReplyOpenFor(null); setReplyText(""); }}>Hủy</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles._composerRow}>
                  {currentUser?.avatarUrl ? (
                    <img className={styles._composerAvatar} src={currentUser.avatarUrl} alt="" />
                  ) : (
                    <div className={styles._composerAvatarFallback}>{(currentUser?.fullName || currentUser?.username || "T")[0]}</div>
                  )}
                  <input
                    className={styles._composerInput}
                    placeholder="Viết bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={onNewCommentKeyDown}
                  />
                  <button
                    className={styles._composerSend}
                    onClick={submitNewComment}
                    disabled={!newComment.trim()}
                    title={!newComment.trim() ? "Nhập nội dung để gửi" : "Gửi bình luận"}
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

