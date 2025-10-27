import { useEffect, useState } from "react";
import styles from "./CouponManager.module.css";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Form state for creating/editing coupons
  const [formData, setFormData] = useState({
    code: '',
    type: 'percent',
    amount: '',
    maxDiscount: '',
    minOrder: '',
    startAt: '',
    endAt: '',
    usageLimit: '',
    isActive: true
  });

  const fetchCoupons = async (page = 1) => {
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
      if (statusFilter) params.append('status', statusFilter);

      const url = `${API_BASE}/api/admin/coupons?${params}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách khuyến mãi');
      }

      const data = await response.json();
      setCoupons(data.coupons);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/coupons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo khuyến mãi');
      }

      setShowModal(false);
      resetForm();
      fetchCoupons(currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/coupons/${editCoupon._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật khuyến mãi');
      }

      setShowEditModal(false);
      setEditCoupon(null);
      resetForm();
      fetchCoupons(currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể xóa khuyến mãi');
      }

      fetchCoupons(currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      amount: coupon.amount.toString(),
      maxDiscount: coupon.maxDiscount.toString(),
      minOrder: coupon.minOrder.toString(),
      startAt: coupon.startAt ? new Date(coupon.startAt).toISOString().split('T')[0] : '',
      endAt: coupon.endAt ? new Date(coupon.endAt).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit.toString(),
      isActive: coupon.isActive
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percent',
      amount: '',
      maxDiscount: '',
      minOrder: '',
      startAt: '',
      endAt: '',
      usageLimit: '',
      isActive: true
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCoupons(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCoupons(page);
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const endDate = coupon.endAt ? new Date(coupon.endAt) : null;
    
    if (!coupon.isActive) {
      return <span className={styles.statusInactive}>Không hoạt động</span>;
    }
    
    if (endDate && endDate < now) {
      return <span className={styles.statusExpired}>Hết hạn</span>;
    }
    
    return <span className={styles.statusActive}>Hoạt động</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý khuyến mãi</h2>
        <button 
          onClick={() => setShowModal(true)}
          className={styles.addButton}
        >
          Thêm khuyến mãi
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Search và Filter */}
      <div className={styles.filters}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã khuyến mãi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Tìm kiếm
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
            fetchCoupons(1);
          }}
          className={styles.filterSelect}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="expired">Hết hạn</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      {/* Danh sách coupons */}
      <div className={styles.couponsList}>
        {coupons.length === 0 ? (
          <div className={styles.noData}>Không có khuyến mãi nào</div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon._id} className={styles.couponCard}>
              <div className={styles.couponHeader}>
                <div className={styles.couponCode}>
                  <strong>{coupon.code}</strong>
                  {getStatusBadge(coupon)}
                </div>
                <div className={styles.couponActions}>
                  <button
                    onClick={() => handleEditCoupon(coupon)}
                    className={styles.editButton}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(coupon._id)}
                    className={styles.deleteButton}
                  >
                    Xóa
                  </button>
                </div>
              </div>

              <div className={styles.couponDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Loại:</span>
                  <span>{coupon.type === 'percent' ? 'Phần trăm' : 'Số tiền cố định'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Giá trị:</span>
                  <span>
                    {coupon.type === 'percent' 
                      ? `${coupon.amount}%` 
                      : formatCurrency(coupon.amount)
                    }
                  </span>
                </div>
                {coupon.maxDiscount > 0 && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Giảm tối đa:</span>
                    <span>{formatCurrency(coupon.maxDiscount)}</span>
                  </div>
                )}
                {coupon.minOrder > 0 && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Đơn tối thiểu:</span>
                    <span>{formatCurrency(coupon.minOrder)}</span>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span className={styles.label}>Bắt đầu:</span>
                  <span>{new Date(coupon.startAt).toLocaleDateString('vi-VN')}</span>
                </div>
                {coupon.endAt && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Kết thúc:</span>
                    <span>{new Date(coupon.endAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span className={styles.label}>Đã sử dụng:</span>
                  <span>{coupon.usedCount} / {coupon.usageLimit || '∞'}</span>
                </div>
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

      {/* Modal tạo coupon */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Thêm khuyến mãi mới</h3>
              <button 
                onClick={() => setShowModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateCoupon} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Mã khuyến mãi *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                  placeholder="VD: SUMMER2024"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Loại khuyến mãi *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="percent">Phần trăm</option>
                  <option value="fixed">Số tiền cố định</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Giá trị *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  placeholder={formData.type === 'percent' ? '10' : '50000'}
                />
              </div>
              
              {formData.type === 'percent' && (
                <div className={styles.formGroup}>
                  <label>Giảm tối đa (VND)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                    placeholder="100000"
                  />
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label>Đơn tối thiểu (VND)</label>
                <input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({...formData, minOrder: e.target.value})}
                  placeholder="0"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Ngày bắt đầu</label>
                <input
                  type="date"
                  value={formData.startAt}
                  onChange={(e) => setFormData({...formData, startAt: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Ngày kết thúc</label>
                <input
                  type="date"
                  value={formData.endAt}
                  onChange={(e) => setFormData({...formData, endAt: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Giới hạn sử dụng</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  placeholder="0 = không giới hạn"
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
                <button type="submit">Tạo khuyến mãi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal sửa coupon */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Sửa khuyến mãi</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateCoupon} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Mã khuyến mãi *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Loại khuyến mãi *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="percent">Phần trăm</option>
                  <option value="fixed">Số tiền cố định</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Giá trị *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
              
              {formData.type === 'percent' && (
                <div className={styles.formGroup}>
                  <label>Giảm tối đa (VND)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                  />
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label>Đơn tối thiểu (VND)</label>
                <input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({...formData, minOrder: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Ngày bắt đầu</label>
                <input
                  type="date"
                  value={formData.startAt}
                  onChange={(e) => setFormData({...formData, startAt: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Ngày kết thúc</label>
                <input
                  type="date"
                  value={formData.endAt}
                  onChange={(e) => setFormData({...formData, endAt: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Giới hạn sử dụng</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
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
