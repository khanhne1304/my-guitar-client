import { useEffect, useState } from "react";
import styles from "./NotificationManager.module.css";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function NotificationManager() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editNotification, setEditNotification] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Form state for creating/editing notifications
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    priority: 'medium',
    targetAudience: 'all',
    targetUsers: [],
    isActive: true,
    scheduledAt: '',
    expiresAt: '',
    imageUrl: '',
    actionUrl: '',
    actionText: ''
  });

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
      
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const url = `${API_BASE}/api/admin/notifications?${params}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách thông báo');
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

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo thông báo');
      }

      setShowModal(false);
      resetForm();
      fetchNotifications(currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateNotification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/notifications/${editNotification._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật thông báo');
      }

      setShowEditModal(false);
      setEditNotification(null);
      resetForm();
      fetchNotifications(currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể xóa thông báo');
      }

      fetchNotifications(currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditNotification = (notification) => {
    setEditNotification(notification);
    setFormData({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      priority: notification.priority,
      targetAudience: notification.targetAudience,
      targetUsers: notification.targetUsers || [],
      isActive: notification.isActive,
      scheduledAt: notification.scheduledAt ? new Date(notification.scheduledAt).toISOString().split('T')[0] : '',
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().split('T')[0] : '',
      imageUrl: notification.imageUrl || '',
      actionUrl: notification.actionUrl || '',
      actionText: notification.actionText || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      priority: 'medium',
      targetAudience: 'all',
      targetUsers: [],
      isActive: true,
      scheduledAt: '',
      expiresAt: '',
      imageUrl: '',
      actionUrl: '',
      actionText: ''
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNotifications(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNotifications(page);
  };

  const getStatusBadge = (notification) => {
    const now = new Date();
    const scheduledDate = notification.scheduledAt ? new Date(notification.scheduledAt) : null;
    const expiresDate = notification.expiresAt ? new Date(notification.expiresAt) : null;
    
    if (!notification.isActive) {
      return <span className={styles.statusInactive}>Không hoạt động</span>;
    }
    
    if (expiresDate && expiresDate < now) {
      return <span className={styles.statusExpired}>Hết hạn</span>;
    }
    
    if (scheduledDate && scheduledDate > now) {
      return <span className={styles.statusScheduled}>Đã lên lịch</span>;
    }
    
    return <span className={styles.statusActive}>Hoạt động</span>;
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

  const getTypeText = (type) => {
    const types = {
      general: 'Chung',
      promotion: 'Khuyến mãi',
      system: 'Hệ thống',
      order: 'Đơn hàng',
      product: 'Sản phẩm'
    };
    return types[type] || type;
  };

  const getTargetAudienceText = (audience) => {
    const audiences = {
      all: 'Tất cả',
      registered: 'Người dùng đã đăng ký',
      premium: 'Người dùng premium',
      specific: 'Người dùng cụ thể'
    };
    return audiences[audience] || audience;
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý thông báo</h2>
        <button 
          onClick={() => setShowModal(true)}
          className={styles.addButton}
        >
          Thêm thông báo
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Search và Filter */}
      <div className={styles.filters}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Tìm kiếm
          </button>
        </form>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
            fetchNotifications(1);
          }}
          className={styles.filterSelect}
        >
          <option value="">Tất cả loại</option>
          <option value="general">Chung</option>
          <option value="promotion">Khuyến mãi</option>
          <option value="system">Hệ thống</option>
          <option value="order">Đơn hàng</option>
          <option value="product">Sản phẩm</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
            fetchNotifications(1);
          }}
          className={styles.filterSelect}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="expired">Hết hạn</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      {/* Danh sách notifications */}
      <div className={styles.notificationsList}>
        {notifications.length === 0 ? (
          <div className={styles.noData}>Không có thông báo nào</div>
        ) : (
          notifications.map((notification) => (
            <div key={notification._id} className={styles.notificationCard}>
              <div className={styles.notificationHeader}>
                <div className={styles.notificationTitle}>
                  <h3>{notification.title}</h3>
                  <div className={styles.badges}>
                    {getStatusBadge(notification)}
                    {getPriorityBadge(notification.priority)}
                    <span className={styles.typeBadge}>{getTypeText(notification.type)}</span>
                  </div>
                </div>
                <div className={styles.notificationActions}>
                  <button
                    onClick={() => handleEditNotification(notification)}
                    className={styles.editButton}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    className={styles.deleteButton}
                  >
                    Xóa
                  </button>
                </div>
              </div>

              <div className={styles.notificationContent}>
                <p>{notification.content}</p>
              </div>

              <div className={styles.notificationDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Đối tượng:</span>
                  <span>{getTargetAudienceText(notification.targetAudience)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Lên lịch:</span>
                  <span>{new Date(notification.scheduledAt).toLocaleString('vi-VN')}</span>
                </div>
                {notification.expiresAt && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Hết hạn:</span>
                    <span>{new Date(notification.expiresAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span className={styles.label}>Lượt click:</span>
                  <span>{notification.clickCount}</span>
                </div>
                {notification.actionUrl && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Hành động:</span>
                    <span>{notification.actionText || notification.actionUrl}</span>
                  </div>
                )}
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

      {/* Modal tạo notification */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Thêm thông báo mới</h3>
              <button 
                onClick={() => setShowModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateNotification} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Nhập tiêu đề thông báo"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Nội dung *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                  rows={4}
                  placeholder="Nhập nội dung thông báo"
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Loại thông báo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="general">Chung</option>
                    <option value="promotion">Khuyến mãi</option>
                    <option value="system">Hệ thống</option>
                    <option value="order">Đơn hàng</option>
                    <option value="product">Sản phẩm</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Mức độ ưu tiên</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                    <option value="urgent">Khẩn cấp</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Đối tượng nhận</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                >
                  <option value="all">Tất cả</option>
                  <option value="registered">Người dùng đã đăng ký</option>
                  <option value="premium">Người dùng premium</option>
                  <option value="specific">Người dùng cụ thể</option>
                </select>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ngày lên lịch</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Ngày hết hạn</label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>URL hình ảnh</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>URL hành động</label>
                <input
                  type="url"
                  value={formData.actionUrl}
                  onChange={(e) => setFormData({...formData, actionUrl: e.target.value})}
                  placeholder="https://example.com/action"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Văn bản hành động</label>
                <input
                  type="text"
                  value={formData.actionText}
                  onChange={(e) => setFormData({...formData, actionText: e.target.value})}
                  placeholder="Xem chi tiết"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  Kích hoạt ngay
                </label>
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit">Tạo thông báo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal sửa notification */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Sửa thông báo</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateNotification} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Nội dung *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                  rows={4}
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Loại thông báo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="general">Chung</option>
                    <option value="promotion">Khuyến mãi</option>
                    <option value="system">Hệ thống</option>
                    <option value="order">Đơn hàng</option>
                    <option value="product">Sản phẩm</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Mức độ ưu tiên</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                    <option value="urgent">Khẩn cấp</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Đối tượng nhận</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                >
                  <option value="all">Tất cả</option>
                  <option value="registered">Người dùng đã đăng ký</option>
                  <option value="premium">Người dùng premium</option>
                  <option value="specific">Người dùng cụ thể</option>
                </select>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ngày lên lịch</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Ngày hết hạn</label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>URL hình ảnh</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>URL hành động</label>
                <input
                  type="url"
                  value={formData.actionUrl}
                  onChange={(e) => setFormData({...formData, actionUrl: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Văn bản hành động</label>
                <input
                  type="text"
                  value={formData.actionText}
                  onChange={(e) => setFormData({...formData, actionText: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  Kích hoạt
                </label>
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Hủy
                </button>
                <button type="submit">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
