import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './NotificationBell.module.css';
import { getPresenceSocket } from '../../services/presenceSocket';
import { apiClient } from '../../services/apiClient';
import { getToken } from '../../utils/storage';
import { MESSAGE_REALTIME_EVENT, CHAT_OPENED_EVENT, CHAT_CLOSED_EVENT } from '../../services/messageRealtime';
import { getUnreadMessagesCountApi, getConversationsApi } from '../../services/messageService';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadPeerName, setUnreadPeerName] = useState('');
  const [showMessageAlert, setShowMessageAlert] = useState(false);
  const chatPanelOpenRef = useRef(false);
  const primaryUnreadPeerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    if (!getToken()) return;
    try {
      const data = await apiClient.get('/notifications/unread-count');
      setUnreadCount(data?.unreadCount ?? 0);
    } catch (error) {
      if (error.status === 401) {
        setUnreadCount(0);
        return;
      }
      console.error('Error fetching unread count:', error);
    }
  };

  const refreshPrimaryUnreadPeer = useCallback(async () => {
    if (!getToken()) {
      primaryUnreadPeerRef.current = null;
      setUnreadPeerName('');
      return null;
    }
    try {
      const rows = await getConversationsApi();
      const list = Array.isArray(rows) ? rows : [];
      const unreadConv = list.find((c) => (c.unread || 0) > 0);
      if (unreadConv?.user?.id) {
        primaryUnreadPeerRef.current = {
          id: unreadConv.user.id,
          name: unreadConv.user.name || 'Người dùng',
          avatar: unreadConv.user.avatarUrl || '',
        };
        setUnreadPeerName(primaryUnreadPeerRef.current.name);
        return primaryUnreadPeerRef.current;
      }
      primaryUnreadPeerRef.current = null;
      setUnreadPeerName('');
      return null;
    } catch {
      return primaryUnreadPeerRef.current;
    }
  }, []);

  const fetchUnreadMessages = useCallback(async ({ showAlertOnNew = false } = {}) => {
    if (!getToken()) {
      setUnreadMessageCount(0);
      setShowMessageAlert(false);
      return;
    }
    try {
      const count = await getUnreadMessagesCountApi();
      const n = Math.max(0, Number(count) || 0);
      setUnreadMessageCount(n);
      if (n === 0) {
        primaryUnreadPeerRef.current = null;
        setUnreadPeerName('');
        setShowMessageAlert(false);
        return;
      }
      await refreshPrimaryUnreadPeer();
      setShowMessageAlert((prev) => {
        if (chatPanelOpenRef.current) return false;
        if (showAlertOnNew || !prev) return true;
        return prev;
      });
    } catch {
      /* giữ trạng thái cũ */
    }
  }, [refreshPrimaryUnreadPeer]);

  const fetchRecentNotifications = async () => {
    if (!getToken()) return;
    try {
      setLoading(true);
      const data = await apiClient.get('/notifications?limit=5');
      setNotifications(data?.notifications ?? []);
    } catch (error) {
      if (error.status !== 401) {
        console.error('Error fetching notifications:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const openUnreadChat = async () => {
    setShowMessageAlert(false);
    setIsOpen(false);

    let peer = primaryUnreadPeerRef.current;
    if (!peer?.id) {
      peer = await refreshPrimaryUnreadPeer();
    }

    if (peer?.id) {
      window.dispatchEvent(
        new CustomEvent('gm:chat:open', {
          detail: { user: peer },
        }),
      );
      return;
    }

    window.dispatchEvent(new CustomEvent('gm:chat:open-panel'));
  };

  const markAsRead = async (notificationId) => {
    if (!getToken()) return;
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const uid = user.id || user._id;
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId
            ? { ...notif, readBy: [...(notif.readBy || []), { user: uid, readAt: new Date() }] }
            : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!getToken()) return;
    try {
      await apiClient.put('/notifications/mark-all-read');
      setUnreadCount(0);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const uid = user.id || user._id;
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          readBy: [...(notif.readBy || []), { user: uid, readAt: new Date() }],
        })),
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '🔵';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'promotion':
        return '🎉';
      case 'order':
        return '📦';
      case 'product':
        return '🛍️';
      case 'system':
        return '⚙️';
      case 'forum':
        return '🎸';
      default:
        return '📢';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const isUnread = (notification) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uid = user.id || user._id;
    if (!uid) return true;
    const reads = notification.readBy || [];
    return !reads.some((read) => String(read?.user ?? read) === String(uid));
  };

  const totalBadgeCount =
    unreadCount + (showMessageAlert && unreadMessageCount > 0 ? unreadMessageCount : 0);

  useEffect(() => {
    fetchUnreadCount();
    fetchUnreadMessages();

    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchUnreadMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadMessages]);

  useEffect(() => {
    const socket = getPresenceSocket();
    const onForumEvent = () => {
      fetchUnreadCount();
      setIsOpen((open) => {
        if (open) fetchRecentNotifications();
        return open;
      });
    };
    const onNewMessage = (e) => {
      const payload = e?.detail;
      if (payload?.peer?.id && payload?.message && !payload.message.fromMe) {
        primaryUnreadPeerRef.current = {
          id: payload.peer.id,
          name: payload.peer.name || 'Người dùng',
          avatar: payload.peer.avatarUrl || '',
        };
        setUnreadPeerName(primaryUnreadPeerRef.current.name);
      }
      fetchUnreadMessages({ showAlertOnNew: true });
    };
    const onChatOpened = () => {
      chatPanelOpenRef.current = true;
      setShowMessageAlert(false);
      fetchUnreadMessages();
    };
    const onChatClosed = () => {
      chatPanelOpenRef.current = false;
      fetchUnreadMessages();
    };

    socket.on('new_reply', onForumEvent);
    socket.on('new_like', onForumEvent);
    socket.on('reply_to_reply', onForumEvent);
    socket.on('admin_reminder', onForumEvent);
    window.addEventListener(MESSAGE_REALTIME_EVENT, onNewMessage);
    window.addEventListener(CHAT_OPENED_EVENT, onChatOpened);
    window.addEventListener(CHAT_CLOSED_EVENT, onChatClosed);

    return () => {
      socket.off('new_reply', onForumEvent);
      socket.off('new_like', onForumEvent);
      socket.off('reply_to_reply', onForumEvent);
      socket.off('admin_reminder', onForumEvent);
      window.removeEventListener(MESSAGE_REALTIME_EVENT, onNewMessage);
      window.removeEventListener(CHAT_OPENED_EVENT, onChatOpened);
      window.removeEventListener(CHAT_CLOSED_EVENT, onChatClosed);
    };
  }, [fetchUnreadMessages]);

  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
      fetchUnreadMessages();
    }
  }, [isOpen, fetchUnreadMessages]);

  const messageAlertText = (() => {
    if (unreadMessageCount === 1) {
      return unreadPeerName
        ? `${unreadPeerName} gửi tin nhắn chưa đọc`
        : 'Bạn có 1 tin nhắn chưa đọc';
    }
    return unreadPeerName
      ? `Bạn có ${unreadMessageCount} tin nhắn chưa đọc (mới nhất từ ${unreadPeerName})`
      : `Bạn có ${unreadMessageCount} tin nhắn chưa đọc`;
  })();

  return (
    <div className={styles.notificationBell}>
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Thông báo"
      >
        <span className={styles.bellIcon}>🔔</span>
        {totalBadgeCount > 0 && (
          <span className={styles.badge}>{totalBadgeCount > 99 ? '99+' : totalBadgeCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button className={styles.markAllRead} onClick={markAllAsRead}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className={styles.content}>
            {showMessageAlert && unreadMessageCount > 0 && (
              <div
                className={`${styles.notificationItem} ${styles.messageNotifItem} ${styles.unread}`}
                onClick={openUnreadChat}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openUnreadChat();
                  }
                }}
              >
                <div className={styles.icon}>
                  <span aria-hidden="true">💬</span>
                </div>
                <div className={styles.notificationBody}>
                  <div className={styles.title}>Tin nhắn mới</div>
                  <div className={styles.message}>{messageAlertText}</div>
                  <div className={styles.time}>Nhấn để mở hội thoại</div>
                </div>
                <div className={styles.unreadDot} />
              </div>
            )}

            {loading ? (
              <div className={styles.loading}>Đang tải...</div>
            ) : notifications.length === 0 && !(showMessageAlert && unreadMessageCount > 0) ? (
              <div className={styles.empty}>Không có thông báo nào</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`${styles.notificationItem} ${isUnread(notification) ? styles.unread : ''}`}
                  onClick={() => {
                    if (isUnread(notification)) {
                      markAsRead(notification._id);
                    }
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                >
                  <div className={styles.icon}>
                    {getPriorityIcon(notification.priority)}
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className={styles.notificationBody}>
                    <div className={styles.title}>{notification.title}</div>
                    <div className={styles.message}>{notification.content}</div>
                    <div className={styles.time}>{formatTime(notification.createdAt)}</div>
                  </div>
                  {isUnread(notification) && <div className={styles.unreadDot} />}
                </div>
              ))
            )}
          </div>

          <div className={styles.footer}>
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              Xem tất cả thông báo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
