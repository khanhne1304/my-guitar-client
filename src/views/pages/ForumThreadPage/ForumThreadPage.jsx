import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { forumApi } from '../../../services/forumApi';

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function displayName(u) {
  if (!u) return 'Ẩn danh';
  const full = String(u.fullName || '').trim();
  if (full) return full;
  const username = String(u.username || '').trim();
  if (username) return username;
  const id = String(u._id || u.id || '').trim();
  return id ? `User ${id.slice(-6)}` : 'Ẩn danh';
}

function avatarFallbackLetter(u) {
  const name = displayName(u);
  return String(name || '?').trim().slice(0, 1).toUpperCase() || '?';
}

function UserChip({ user, subline }) {
  const av = String(user?.avatarUrl || '').trim();
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
      {av ? (
        <img
          src={av}
          alt=""
          style={{ width: 34, height: 34, borderRadius: 999, objectFit: 'cover', border: '1px solid #eee', background: '#fff' }}
        />
      ) : (
        <div
          aria-hidden
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            border: '1px solid #eee',
            background: '#f7f7f7',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 900,
            color: '#444',
          }}
        >
          {avatarFallbackLetter(user)}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#111', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName(user)}
        </div>
        {subline ? (
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {subline}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function parseTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.filter(Boolean).map(String);
}

function typeLabel(v) {
  if (v === 'question') return 'Hỏi đáp';
  if (v === 'tutorial') return 'Hướng dẫn';
  if (v === 'discussion') return 'Thảo luận';
  if (v === 'tab') return 'Tab/Bản nhạc';
  return 'Thảo luận';
}

function categoryLabel(v) {
  if (v === 'lesson') return 'Học guitar';
  if (v === 'tab') return 'Tab guitar';
  if (v === 'chord') return 'Hợp âm';
  if (v === 'discussion') return 'Thảo luận';
  return 'Thảo luận';
}

function likeLabel(n) {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return String(v);
}

export default function ForumThreadPage({ legacyParam }) {
  const params = useParams();
  const navigate = useNavigate();
  const threadId = legacyParam ? params?.[legacyParam] : params?.threadId;
  const [me, setMe] = useState(() => getCurrentUser());
  const [thread, setThread] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [repliesByAnswerId, setRepliesByAnswerId] = useState(() => new Map());
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [answerLikes, setAnswerLikes] = useState(() => new Map()); // answerId -> { likeCount, liked }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const reload = () => setMe(getCurrentUser());
    window.addEventListener('user:profile-changed', reload);
    window.addEventListener('storage', (e) => {
      if (e?.key === 'user') reload();
    });
    return () => {
      window.removeEventListener('user:profile-changed', reload);
    };
  }, []);

  useEffect(() => {
    if (!threadId) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const t = await forumApi.getThread(threadId);
        const ans = await forumApi.listAnswers(threadId);

        if (!alive) return;
        setThread(t || null);
        setAnswers(Array.isArray(ans) ? ans : []);
        setLikeCount(typeof t?.likeCount === 'number' ? t.likeCount : 0);
        setLiked(false);
        setAnswerLikes(() => {
          const next = new Map();
          (Array.isArray(ans) ? ans : []).forEach((a) => {
            const aid = String(a?._id || a?.id || '');
            if (!aid) return;
            next.set(aid, { likeCount: typeof a?.likeCount === 'number' ? a.likeCount : 0, liked: false });
          });
          return next;
        });

        // Load replies per answer
        const list = Array.isArray(ans) ? ans : [];
        const replyPairs = await Promise.all(
          list.map(async (a) => {
            const aid = a?._id || a?.id;
            if (!aid) return [null, []];
            try {
              const reps = await forumApi.listReplies(aid);
              return [String(aid), Array.isArray(reps) ? reps : []];
            } catch {
              return [String(aid), []];
            }
          }),
        );

        if (!alive) return;
        const map = new Map();
        replyPairs.forEach(([k, v]) => {
          if (!k) return;
          map.set(String(k), v);
        });
        setRepliesByAnswerId(map);
      } catch (e) {
        if (!alive) return;
        setThread(null);
        setAnswers([]);
        setRepliesByAnswerId(new Map());
        setLiked(false);
        setLikeCount(0);
        setAnswerLikes(new Map());
        setError(e?.message || 'Không thể tải chủ đề.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [threadId]);

  const bestFirst = useMemo(() => {
    const bestAnswerId = thread?.bestAnswer?._id || thread?.bestAnswer || null;
    const bestId = bestAnswerId ? String(bestAnswerId) : null;
    const list = (answers || []).slice().sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    if (!bestId) return list;
    const best = list.find((a) => String(a._id || a.id) === bestId) || list.find((a) => a.isBestAnswer);
    if (!best) return list;
    return [best, ...list.filter((a) => String(a._id || a.id) !== String(best._id || best.id))];
  }, [answers, thread?.bestAnswer]);

  const myId = String(me?.id || me?._id || me?.userId || 'self');
  const isOwner = thread ? String(thread?.user?._id || thread?.userId || '') === myId : false;

  async function deleteThisThread() {
    if (!threadId) return;
    if (!isOwner) return;
    const ok = window.confirm('Bạn có chắc muốn xoá bài viết này không? Hành động này không thể hoàn tác.');
    if (!ok) return;
    try {
      await forumApi.deleteThread(String(threadId));
      window.alert('Đã xoá bài viết.');
      navigate('/forum');
    } catch (e) {
      window.alert(e?.message || 'Không thể xoá bài viết.');
    }
  }

  async function onToggleLike() {
    if (!threadId) return;
    try {
      const res = await forumApi.toggleLike(String(threadId));
      setLiked(!!res?.liked);
      setLikeCount(typeof res?.likeCount === 'number' ? res.likeCount : 0);
    } catch {
      // ignore
    }
  }

  async function onToggleAnswerLike(answerId) {
    const aid = String(answerId || '');
    if (!aid) return;
    try {
      const res = await forumApi.toggleAnswerLike(aid);
      setAnswerLikes((prev) => {
        const next = new Map(prev);
        next.set(aid, { likeCount: typeof res?.likeCount === 'number' ? res.likeCount : 0, liked: !!res?.liked });
        return next;
      });
    } catch {
      // ignore
    }
  }

  async function onUpdateAnswer(answerId, content) {
    const aid = String(answerId || '');
    if (!aid) return;
    try {
      const updated = await forumApi.updateAnswer({ answerId: aid, content });
      setAnswers((prev) => (prev || []).map((a) => (String(a?._id || a?.id) === aid ? { ...a, ...updated } : a)));
      setAnswerLikes((prev) => {
        const next = new Map(prev);
        const likeCount = typeof updated?.likeCount === 'number' ? updated.likeCount : (next.get(aid)?.likeCount ?? 0);
        const likedNow = next.get(aid)?.liked ?? false;
        next.set(aid, { likeCount, liked: likedNow });
        return next;
      });
    } catch {
      // ignore
    }
  }

  async function onDeleteAnswer(answerId) {
    const aid = String(answerId || '');
    if (!aid) return;
    try {
      await forumApi.deleteAnswer(aid);
      setAnswers((prev) => (prev || []).filter((a) => String(a?._id || a?.id) !== aid));
      setRepliesByAnswerId((prev) => {
        const next = new Map(prev);
        next.delete(aid);
        return next;
      });
      setAnswerLikes((prev) => {
        const next = new Map(prev);
        next.delete(aid);
        return next;
      });
      // best answer might have been removed; refresh thread to sync bestAnswer badge
      const t = await forumApi.getThread(threadId);
      setThread(t || null);
    } catch {
      // ignore
    }
  }

  async function onUpdateReply(answerId, replyId, content) {
    const aid = String(answerId || '');
    const rid = String(replyId || '');
    if (!aid || !rid) return;
    try {
      const updated = await forumApi.updateReply({ replyId: rid, content });
      setRepliesByAnswerId((prev) => {
        const next = new Map(prev);
        const list = Array.isArray(next.get(aid)) ? next.get(aid) : [];
        next.set(
          aid,
          (list || []).map((r) => (String(r?._id || r?.id) === rid ? { ...r, ...updated } : r)),
        );
        return next;
      });
    } catch {
      // ignore
    }
  }

  async function onDeleteReply(answerId, replyId) {
    const aid = String(answerId || '');
    const rid = String(replyId || '');
    if (!aid || !rid) return;
    try {
      await forumApi.deleteReply(rid);
      setRepliesByAnswerId((prev) => {
        const next = new Map(prev);
        const list = Array.isArray(next.get(aid)) ? next.get(aid) : [];
        next.set(
          aid,
          (list || []).filter((r) => String(r?._id || r?.id) !== rid),
        );
        return next;
      });
    } catch {
      // ignore
    }
  }

  async function markBestAnswer(answerId) {
    if (!thread || !isOwner) return;
    const aid = String(answerId || '');
    if (!aid) return;
    try {
      await forumApi.markBestAnswer(aid);
      const t = await forumApi.getThread(threadId);
      const ans = await forumApi.listAnswers(threadId);
      setThread(t || null);
      setAnswers(Array.isArray(ans) ? ans : []);
    } catch {
      // ignore
    }
  }

  async function submitAnswer() {
    const text = newAnswer.trim();
    if (!text || !threadId) return;
    try {
      await forumApi.createAnswer({ threadId: String(threadId), content: text });
      setNewAnswer('');
      const ans = await forumApi.listAnswers(threadId);
      setAnswers(Array.isArray(ans) ? ans : []);
    } catch {
      // ignore
    }
  }

  async function submitReply(answerId, text, clear) {
    const t = (text || '').trim();
    if (!t) return;
    try {
      await forumApi.createReply({ answerId: String(answerId), content: t });
      const reps = await forumApi.listReplies(String(answerId));
      setRepliesByAnswerId((prev) => {
        const next = new Map(prev);
        next.set(String(answerId), Array.isArray(reps) ? reps : []);
        return next;
      });
      clear?.();
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div style={{ background: '#fffbe8', minHeight: '100vh' }}>
        <Header />
        <main style={{ padding: '24px 0 40px' }}>
          <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 16px' }}>
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              Đang tải...
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!thread) {
    return (
      <div style={{ background: '#fffbe8', minHeight: '100vh' }}>
        <Header />
        <main style={{ padding: '24px 0 40px' }}>
          <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 16px' }}>
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              {error || 'Không tìm thấy chủ đề.'}
            </div>
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <Link to="/forum">Quay lại diễn đàn</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const effectiveLikeCount = typeof likeCount === 'number' ? likeCount : (typeof thread?.likeCount === 'number' ? thread.likeCount : 0);
  const threadCreated = thread?.createdAt ? new Date(thread.createdAt).toLocaleString('vi-VN') : '';

  return (
    <div style={{ background: '#fffbe8', minHeight: '100vh' }}>
      <Header />
      <main style={{ padding: '24px 0 40px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 64, flex: '0 0 64px', textAlign: 'center', borderRight: '1px solid #f2f2f2', paddingRight: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{likeLabel(effectiveLikeCount)}</div>
                <div style={{ fontSize: 12, color: '#666' }}>lượt thích</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                  <button
                    onClick={onToggleLike}
                    style={{
                      border: liked ? '1px solid #ef4444' : '1px solid #eee',
                      background: liked ? '#fee2e2' : '#fff',
                      color: liked ? '#b91c1c' : '#111',
                      borderRadius: 10,
                      padding: '6px 10px',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                    title={liked ? 'Bỏ thích' : 'Thích'}
                    aria-label={liked ? 'Bỏ thích' : 'Thích'}
                  >
                    ♥
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 999, border: '1px solid #eee', background: '#f7f7f7' }}>{typeLabel(thread.type)}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 999, border: '1px solid #eee', background: '#f7f7f7' }}>{categoryLabel(thread.category)}</span>
                  {thread.bestAnswer ? (
                    <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 999, border: '1px solid #d1fae5', background: '#ecfdf5', color: '#065f46' }}>
                      Đã chọn câu trả lời hay nhất
                    </span>
                  ) : null}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <UserChip user={thread?.user} subline={threadCreated ? `Đăng lúc ${threadCreated}` : ' '} />
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, flex: 1 }}>{thread.title}</h1>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpen((v) => !v);
                      }}
                      aria-label="Tuỳ chọn"
                      title="Tuỳ chọn"
                      style={{ border: '1px solid #eee', background: '#fff', borderRadius: 10, padding: '6px 10px', fontWeight: 900, cursor: 'pointer', lineHeight: 1 }}
                    >
                      ⋯
                    </button>
                    {menuOpen ? (
                      <div
                        role="menu"
                        style={{
                          position: 'absolute',
                          top: 36,
                          right: 0,
                          minWidth: 170,
                          background: '#fff',
                          border: '1px solid #eee',
                          borderRadius: 12,
                          boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                          overflow: 'hidden',
                          zIndex: 5,
                        }}
                      >
                        {isOwner ? (
                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpen(false);
                              deleteThisThread();
                            }}
                            role="menuitem"
                            style={{ width: '100%', textAlign: 'left', border: 'none', background: '#fff', padding: '10px 12px', cursor: 'pointer', fontWeight: 900, color: '#b91c1c' }}
                          >
                            Xoá bài viết
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={async () => {
                            setMenuOpen(false);
                            const reason = window.prompt('Lý do báo cáo chủ đề này?');
                            const text = (reason || '').trim();
                            if (!text) return;
                            try {
                              await forumApi.reportThread({ threadId: String(threadId), reason: text });
                              window.alert('Đã gửi báo cáo. Cảm ơn bạn!');
                            } catch (e) {
                              window.alert(e?.message || 'Không thể gửi báo cáo.');
                            }
                          }}
                          role="menuitem"
                          style={{ width: '100%', textAlign: 'left', border: 'none', background: '#fff', padding: '10px 12px', cursor: 'pointer', fontWeight: 900, color: '#111' }}
                        >
                          Báo cáo
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div style={{ marginTop: 8, color: '#444', whiteSpace: 'pre-wrap' }}>{thread.content}</div>

                {(() => {
                  const img = thread?.mediaUrl || thread?.files?.find((f) => f?.type === 'image')?.url || '';
                  if (!img) return null;
                  return (
                    <div style={{ marginTop: 12 }}>
                      <img src={img} alt="" style={{ width: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 12, border: '1px solid #eee', background: '#fff' }} />
                    </div>
                  );
                })()}

                {Array.isArray(thread?.files) && thread.files.filter((f) => f?.url && f?.type && f.type !== 'image').length ? (
                  <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                    {thread.files
                      .filter((f) => f?.url && f?.type && f.type !== 'image')
                      .map((f) => {
                        const t = String(f.type || '').toLowerCase();
                        const url = String(f.url || '');

                        if (t === 'pdf') {
                          return (
                            <div key={`${t}-${url}`} style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                              <div style={{ padding: '10px 12px', fontWeight: 900, borderBottom: '1px solid #eee' }}>PDF</div>
                              <iframe
                                title="PDF"
                                src={url}
                                style={{ width: '100%', height: 560, border: 0, background: '#fff' }}
                              />
                              <div style={{ padding: '10px 12px' }}>
                                <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 900 }}>
                                  Mở PDF ở tab mới
                                </a>
                              </div>
                            </div>
                          );
                        }

                        if (t === 'audio') {
                          return (
                            <div key={`${t}-${url}`} style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                              <div style={{ padding: '10px 12px', fontWeight: 900, borderBottom: '1px solid #eee' }}>Audio</div>
                              <div style={{ padding: '12px' }}>
                                <audio controls src={url} style={{ width: '100%' }} />
                                <div style={{ marginTop: 8 }}>
                                  <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 900 }}>
                                    Tải/Mở audio
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // fallback for unknown types
                        return (
                          <a
                            key={`${t}-${url}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: 13, fontWeight: 900, color: '#111' }}
                          >
                            Tệp đính kèm ({String(t || 'file').toUpperCase()}): mở
                          </a>
                        );
                      })}
                  </div>
                ) : null}

                {thread?.videoUrl ? (
                  <div style={{ marginTop: 12 }}>
                    {(() => {
                      const raw = String(thread.videoUrl || '').trim();
                      const toEmbed = (url) => {
                        if (!url) return '';
                        try {
                          const u = new URL(url);
                          const host = (u.hostname || '').toLowerCase();
                          if (host.includes('youtu.be')) {
                            const id = u.pathname.replace('/', '').trim();
                            return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : '';
                          }
                          if (host.includes('youtube.com')) {
                            // watch?v=VIDEO_ID
                            const v = u.searchParams.get('v');
                            if (v) return `https://www.youtube.com/embed/${encodeURIComponent(v)}`;
                            // /shorts/VIDEO_ID
                            const m = u.pathname.match(/\/shorts\/([^/]+)/i);
                            if (m?.[1]) return `https://www.youtube.com/embed/${encodeURIComponent(m[1])}`;
                            // /embed/VIDEO_ID
                            const e = u.pathname.match(/\/embed\/([^/]+)/i);
                            if (e?.[1]) return `https://www.youtube.com/embed/${encodeURIComponent(e[1])}`;
                          }
                          return '';
                        } catch {
                          return '';
                        }
                      };

                      const embedUrl = toEmbed(raw);
                      return (
                        <>
                          {embedUrl ? (
                            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', border: '1px solid #eee', background: '#000' }}>
                              <iframe
                                title="YouTube"
                                src={embedUrl}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>
                          ) : null}
                          <div style={{ marginTop: 8 }}>
                            <a href={raw} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 900 }}>
                              Mở video YouTube
                            </a>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : null}
                {parseTags(thread.tags).length > 0 ? (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {parseTags(thread.tags).map((t) => (
                      <span key={t} style={{ fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 999, border: '1px solid #fde68a', background: '#fff7d6', color: '#7a5200' }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Câu trả lời ({bestFirst.length})</div>

            {bestFirst.length === 0 ? (
              <div style={{ color: '#666' }}>Chưa có câu trả lời. Hãy là người đầu tiên giúp bạn ấy!</div>
            ) : (
              bestFirst.map((a) => (
                <AnswerItem
                  key={a._id || a.id}
                  answer={a}
                  isOwner={isOwner}
                  myId={myId}
                  isBest={String(thread?.bestAnswer?._id || thread?.bestAnswer || '') === String(a._id || a.id) || !!a.isBestAnswer}
                  onMarkBest={() => markBestAnswer(a._id || a.id)}
                  likeState={answerLikes.get(String(a._id || a.id)) || { likeCount: typeof a?.likeCount === 'number' ? a.likeCount : 0, liked: false }}
                  onToggleLike={() => onToggleAnswerLike(a._id || a.id)}
                  onUpdate={(content) => onUpdateAnswer(a._id || a.id, content)}
                  onDelete={() => onDeleteAnswer(a._id || a.id)}
                  replies={repliesByAnswerId.get(String(a._id || a.id)) || []}
                  onUpdateReply={(replyId, content) => onUpdateReply(a._id || a.id, replyId, content)}
                  onDeleteReply={(replyId) => onDeleteReply(a._id || a.id, replyId)}
                  onReply={submitReply}
                />
              ))
            )}

            <div style={{ marginTop: 16, borderTop: '1px solid #f2f2f2', paddingTop: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Câu trả lời của bạn</div>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Viết câu trả lời… (kèm tips luyện tập / ví dụ / tabs nếu có)"
                style={{ width: '100%', minHeight: 120, borderRadius: 12, border: '1px solid #eee', padding: 12 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  onClick={submitAnswer}
                  disabled={!newAnswer.trim()}
                  style={{ border: '1px solid #111', background: '#111', color: '#fff', borderRadius: 12, padding: '10px 14px', fontWeight: 900 }}
                >
                  Đăng câu trả lời
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function AnswerItem({
  answer,
  isOwner,
  myId,
  isBest,
  onMarkBest,
  likeState,
  onToggleLike,
  onUpdate,
  onDelete,
  replies,
  onUpdateReply,
  onDeleteReply,
  onReply,
}) {
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(answer?.content || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const answerId = answer?._id || answer?.id;
  const ownerId = String(answer?.user?._id || answer?.userId || answer?.user || '');
  const canEdit = !!myId && !!ownerId && String(myId) === ownerId;
  const likeCount = typeof likeState?.likeCount === 'number' ? likeState.likeCount : 0;
  const liked = !!likeState?.liked;
  const answerCreated = answer?.createdAt ? new Date(answer.createdAt).toLocaleString('vi-VN') : '';

  return (
    <div
      style={{
        border: isBest ? '2px solid #a7f3d0' : '1px solid #eee',
        background: isBest ? '#ecfdf5' : '#fff',
        borderRadius: 12,
        padding: 12,
        marginTop: 10,
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 64, flex: '0 0 64px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#111' }}>{likeLabel(likeCount)}</div>
          <div style={{ fontSize: 12, color: '#666' }}>thích</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <button
              onClick={onToggleLike}
              style={{
                border: liked ? '1px solid #ef4444' : '1px solid #eee',
                background: liked ? '#fee2e2' : '#fff',
                color: liked ? '#b91c1c' : '#111',
                borderRadius: 10,
                padding: '6px 10px',
                fontWeight: 900,
                cursor: 'pointer',
              }}
              title={liked ? 'Bỏ thích' : 'Thích'}
              aria-label={liked ? 'Bỏ thích' : 'Thích'}
            >
              ♥
            </button>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <UserChip user={answer?.user} subline={answerCreated ? `Bình luận lúc ${answerCreated}` : ' '} />
            {isBest ? <div style={{ fontSize: 12, fontWeight: 900, color: '#065f46', whiteSpace: 'nowrap' }}>Câu trả lời hay nhất</div> : null}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <div />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', position: 'relative' }}>
              {isOwner && !isBest ? (
                <button
                  onClick={onMarkBest}
                  style={{ border: '1px solid #10b981', background: '#10b981', color: '#fff', borderRadius: 10, padding: '6px 10px', fontWeight: 900 }}
                >
                  Chọn là câu trả lời hay nhất
                </button>
              ) : null}
              {canEdit ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpen((v) => !v);
                    }}
                    aria-label="Tuỳ chọn"
                    title="Tuỳ chọn"
                    style={{ border: '1px solid #eee', background: '#fff', borderRadius: 10, padding: '6px 10px', fontWeight: 900, cursor: 'pointer', lineHeight: 1 }}
                  >
                    ⋯
                  </button>
                  {menuOpen ? (
                    <div
                      role="menu"
                      style={{
                        position: 'absolute',
                        top: 36,
                        right: 0,
                        minWidth: 140,
                        background: '#fff',
                        border: '1px solid #eee',
                        borderRadius: 12,
                        boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                        overflow: 'hidden',
                        zIndex: 5,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setEditText(answer?.content || '');
                          setEditing(true);
                        }}
                        role="menuitem"
                        style={{ width: '100%', textAlign: 'left', border: 'none', background: '#fff', padding: '10px 12px', cursor: 'pointer', fontWeight: 900, color: '#111' }}
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setMenuOpen(false);
                          const ok = window.confirm('Bạn có chắc muốn xoá câu trả lời này không?');
                          if (!ok) return;
                          await onDelete?.();
                        }}
                        role="menuitem"
                        style={{ width: '100%', textAlign: 'left', border: 'none', background: '#fff', padding: '10px 12px', cursor: 'pointer', fontWeight: 900, color: '#b91c1c' }}
                      >
                        Xoá
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
          {editing ? (
            <div style={{ marginTop: 8 }}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{ width: '100%', minHeight: 90, borderRadius: 12, border: '1px solid #eee', padding: 12 }}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditText(answer?.content || '');
                  }}
                  style={{ border: '1px solid #eee', background: '#fff', borderRadius: 12, padding: '8px 12px', fontWeight: 900 }}
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  disabled={!editText.trim()}
                  onClick={async () => {
                    await onUpdate?.(editText);
                    setEditing(false);
                  }}
                  style={{ border: '1px solid #111', background: '#111', color: '#fff', borderRadius: 12, padding: '8px 12px', fontWeight: 900 }}
                >
                  Lưu
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 8, whiteSpace: 'pre-wrap', color: '#222' }}>{answer?.content}</div>
          )}

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 6 }}>Phản hồi</div>
            {(replies || []).length === 0 ? (
              <div style={{ color: '#666', fontSize: 13 }}>Chưa có phản hồi.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(replies || []).map((r) => (
                  <ReplyItem
                    key={r._id || r.id}
                    reply={r}
                    myId={myId}
                    onUpdate={(content) => onUpdateReply?.(r._id || r.id, content)}
                    onDelete={() => onDeleteReply?.(r._id || r.id)}
                  />
                ))}
              </div>
            )}

            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết phản hồi…"
                style={{ flex: 1, borderRadius: 12, border: '1px solid #eee', padding: '10px 12px' }}
              />
              <button
                onClick={() => onReply(answerId, replyText, () => setReplyText(''))}
                disabled={!replyText.trim()}
                style={{ border: '1px solid #111', background: '#111', color: '#fff', borderRadius: 12, padding: '10px 12px', fontWeight: 900 }}
              >
                Trả lời
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReplyItem({ reply, myId, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(reply?.content || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const ownerId = String(reply?.user?._id || reply?.userId || reply?.user || '');
  const canEdit = !!myId && !!ownerId && String(myId) === ownerId;
  const replyCreated = reply?.createdAt ? new Date(reply.createdAt).toLocaleString('vi-VN') : '';

  return (
    <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 12, padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <UserChip user={reply?.user} subline={replyCreated ? `Phản hồi lúc ${replyCreated}` : ' '} />
        {canEdit ? (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              aria-label="Tuỳ chọn"
              title="Tuỳ chọn"
              style={{ border: '1px solid #eee', background: '#fff', borderRadius: 10, padding: '4px 8px', fontWeight: 900, cursor: 'pointer', lineHeight: 1 }}
            >
              ⋯
            </button>
            {menuOpen ? (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  top: 30,
                  right: 0,
                  minWidth: 140,
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: 12,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  zIndex: 5,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setText(reply?.content || '');
                    setEditing(true);
                  }}
                  role="menuitem"
                  style={{ width: '100%', textAlign: 'left', border: 'none', background: '#fff', padding: '10px 12px', cursor: 'pointer', fontWeight: 900, color: '#111' }}
                >
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setMenuOpen(false);
                    const ok = window.confirm('Bạn có chắc muốn xoá phản hồi này không?');
                    if (!ok) return;
                    await onDelete?.();
                  }}
                  role="menuitem"
                  style={{ width: '100%', textAlign: 'left', border: 'none', background: '#fff', padding: '10px 12px', cursor: 'pointer', fontWeight: 900, color: '#b91c1c' }}
                >
                  Xoá
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {editing ? (
        <div style={{ marginTop: 6 }}>
          <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%', minHeight: 70, borderRadius: 12, border: '1px solid #eee', padding: 10 }} />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setText(reply?.content || '');
              }}
              style={{ border: '1px solid #eee', background: '#fff', borderRadius: 12, padding: '8px 12px', fontWeight: 900 }}
            >
              Huỷ
            </button>
            <button
              type="button"
              disabled={!text.trim()}
              onClick={async () => {
                await onUpdate?.(text);
                setEditing(false);
              }}
              style={{ border: '1px solid #111', background: '#111', color: '#fff', borderRadius: 12, padding: '8px 12px', fontWeight: 900 }}
            >
              Lưu
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{reply?.content}</div>
      )}
    </div>
  );
}

