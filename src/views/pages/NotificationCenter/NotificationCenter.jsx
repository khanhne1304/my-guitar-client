import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './NotificationCenter.module.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Vui lòng đăng nhập lại');
        return;
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (typeFilter) params.append('type', typeFilter);
      if (unreadOnly) params.append('unreadOnly', 'true');

      const url = `${API_BASE}/api/notifications?${params}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải thông báo');
      }

      const data = await response.json();
      setNotifications(data.notifications);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      setError(err.message);
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
        // Cập nhật local state - lấy userId từ user object
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, readBy: [...(notif.readBy || []), { user: user.id, readAt: new Date() }] }
              : notif
          )
        );
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

  const hideNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notifications/${notificationId}/hide`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      }
    } catch (error) {
      console.error('Error hiding notification:', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNotifications(page);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchNotifications(1);
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { class: styles.priorityLow, text: 'Thấp' },
      medium: { class: styles.priorityMedium, text: 'Trung bình' },
      high: { class: styles.priorityHigh, text: 'Cao' },
      urgent: { class: styles.priorityUrgent, text: 'Khẩn cấp' }
    };
    
    const badge = badges[priority] || badges.medium;
    return <span className={badge.class}>{badge.text}</span>;
  };

  const getTypeBadge = (type) => {
    const badges = {
      general: { class: styles.typeGeneral, text: 'Chung', icon: '📢' },
      promotion: { class: styles.typePromotion, text: 'Khuyến mãi', icon: '🎉' },
      system: { class: styles.typeSystem, text: 'Hệ thống', icon: '⚙️' },
      order: { class: styles.typeOrder, text: 'Đơn hàng', icon: '📦' },
      product: { class: styles.typeProduct, text: 'Sản phẩm', icon: '🛍️' }
    };
    
    const badge = badges[type] || badges.general;
    return <span className={badge.class}>{badge.icon} {badge.text}</span>;
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
    fetchNotifications();
  }, []);

  useEffect(() => {
    handleFilterChange();
  }, [typeFilter, unreadOnly]);

  if (loading && notifications.length === 0) {
    return <div className={styles.loading}>Đang tải thông báo...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Thông báo</h1>
        <div className={styles.actions}>
          <button 
            onClick={markAllAsRead}
            className={styles.markAllReadBtn}
            disabled={notifications.filter(isUnread).length === 0}
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Tất cả loại</option>
          <option value="general">Chung</option>
          <option value="promotion">Khuyến mãi</option>
          <option value="system">Hệ thống</option>
          <option value="order">Đơn hàng</option>
          <option value="product">Sản phẩm</option>
        </select>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
          />
          Chỉ hiển thị chưa đọc
        </label>
      </div>

      {/* Notifications List */}
      <div className={styles.notificationsList}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <h3>Không có thông báo nào</h3>
            <p>Bạn sẽ nhận được thông báo khi có hoạt động mới.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`${styles.notificationCard} ${isUnread(notification) ? styles.unread : ''}`}
            >
              <div className={styles.notificationHeader}>
                <div className={styles.badges}>
                  {getTypeBadge(notification.type)}
                  {getPriorityBadge(notification.priority)}
                </div>
                <div className={styles.time}>{formatTime(notification.createdAt)}</div>
              </div>

              <div className={styles.notificationContent}>
                <h3 className={styles.title}>{notification.title}</h3>
                <p className={styles.message}>{notification.content}</p>
                
                {notification.imageUrl && (
                  <div className={styles.imageContainer}>
                    <img src={notification.imageUrl} alt="Notification" className={styles.image} />
                  </div>
                )}
              </div>

              <div className={styles.notificationActions}>
                {isUnread(notification) && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className={styles.markReadBtn}
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                
                {notification.actionUrl && (
                  <a 
                    href={notification.actionUrl}
                    className={styles.actionBtn}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {notification.actionText || 'Xem chi tiết'}
                  </a>
                )}
                
                <button
                  onClick={() => hideNotification(notification._id)}
                  className={styles.hideBtn}
                >
                  Ẩn
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className={styles.pageButton}
          >
            Trước
          </button>
          
          <span className={styles.pageInfo}>
            Trang {pagination.currentPage} / {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className={styles.pageButton}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
