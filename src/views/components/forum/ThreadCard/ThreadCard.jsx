import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ThreadCard.module.css';
import { forumApi } from '../../../../services/forumApi';

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function ThreadCard({ thread, onDeleted }) {
  const threadId = thread?._id || thread?.id;
  const likeCount = typeof thread?.likeCount === 'number' ? thread.likeCount : 0;
  const answersCount = typeof thread?.answersCount === 'number' ? thread.answersCount : null;
  const hasBest = !!(thread?.bestAnswer || thread?.bestAnswerId);
  const isAnswered = (answersCount ?? 0) > 0;
  const me = getCurrentUser();
  const myId = String(me?.id || me?._id || me?.userId || 'self');
  const ownerId = String(thread?.user?._id || thread?.userId || '');
  const isOwner = !!threadId && ownerId && ownerId === myId;
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleDelete(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!threadId) return;
    const ok = window.confirm('Bạn có chắc muốn xoá bài viết này không? Hành động này không thể hoàn tác.');
    if (!ok) return;
    try {
      await forumApi.deleteThread(String(threadId));
      onDeleted?.(String(threadId));
    } catch (err) {
      window.alert(err?.message || 'Không thể xoá bài viết.');
    }
  }

  const typeLabel =
    thread?.type === 'question' ? 'Hỏi đáp'
    : thread?.type === 'tutorial' ? 'Hướng dẫn'
    : thread?.type === 'discussion' ? 'Thảo luận'
    : thread?.type === 'tab' ? 'Tab/Bản nhạc'
    : (thread?.type || 'Thảo luận');

  const categoryLabel =
    thread?.category === 'lesson' ? 'Học guitar'
    : thread?.category === 'tab' ? 'Tab guitar'
    : thread?.category === 'chord' ? 'Hợp âm'
    : thread?.category === 'discussion' ? 'Thảo luận'
    : (thread?.category || 'Thảo luận');

  return (
    <article className={styles._card} style={{ position: 'relative' }}>
      {isOwner ? (
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            aria-label="Tuỳ chọn"
            title="Tuỳ chọn"
            style={{
              border: '1px solid #eee',
              background: '#fff',
              borderRadius: 10,
              padding: '6px 10px',
              fontWeight: 900,
              cursor: 'pointer',
              lineHeight: 1,
            }}
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
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  setMenuOpen(false);
                  handleDelete(e);
                }}
                role="menuitem"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: '#fff',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  fontWeight: 900,
                  color: '#b91c1c',
                }}
              >
                Xoá bài viết
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={styles._top}>
        <div className={styles._votes} aria-label="Số lượt thích">
          <div className={styles._score}>{likeCount}</div>
          <div style={{ fontSize: 12, color: '#666' }}>thích</div>
        </div>
        <div className={styles._meta}>
          <h3 className={styles._title}>
            <Link className={styles._titleLink} to={`/forum/thread/${encodeURIComponent(threadId)}`}>
              {thread?.title || 'Chủ đề'}
            </Link>
          </h3>
          <div className={styles._sub}>
            <span className={styles._badge}>{typeLabel}</span>
            <span className={styles._badge}>{categoryLabel}</span>
            {hasBest ? <span className={styles._badge}>Câu trả lời hay nhất</span> : null}
            {!hasBest && isAnswered ? <span className={styles._badge}>Đã có trả lời</span> : null}
            {!isAnswered ? <span className={styles._badge}>Chưa có trả lời</span> : null}
          </div>

          {(thread?.tags || []).length > 0 ? (
            <div className={styles._tags}>
              {(thread.tags || []).slice(0, 8).map((t) => (
                <span key={t} className={styles._tag}>#{t}</span>
              ))}
            </div>
          ) : null}

          <div className={styles._stats}>
            <span>{answersCount ?? '—'} câu trả lời</span>
            <span>•</span>
            <span>{thread?.createdAt ? new Date(thread.createdAt).toLocaleString('vi-VN') : ''}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

