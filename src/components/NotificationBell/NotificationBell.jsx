import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './NotificationBell.module.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/notifications?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Cập nhật local state - lấy userId từ token
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, readBy: [...(notif.readBy || []), { user: user.id, readAt: new Date() }] }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setUnreadCount(0);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setNotifications(prev => 
          prev.map(notif => ({
            ...notif,
            readBy: [...(notif.readBy || []), { user: user.id, readAt: new Date() }]
          }))
        );
      }
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
    return !notification.readBy?.some(read => read.user === user.id);
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Polling để cập nhật số lượng thông báo chưa đọc
    const interval = setInterval(fetchUnreadCount, 30000); // 30 giây
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen]);

  return (
    <div className={styles.notificationBell}>
      <button 
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Thông báo"
      >
        <span className={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                className={styles.markAllRead}
                onClick={markAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className={styles.content}>
            {loading ? (
              <div className={styles.loading}>Đang tải...</div>
            ) : notifications.length === 0 ? (
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
                  <div className={styles.content}>
                    <div className={styles.title}>{notification.title}</div>
                    <div className={styles.message}>{notification.content}</div>
                    <div className={styles.time}>{formatTime(notification.createdAt)}</div>
                  </div>
                  {isUnread(notification) && <div className={styles.unreadDot}></div>}
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
