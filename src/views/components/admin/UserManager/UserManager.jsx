import { useEffect, useState } from "react";
import styles from "./UserManager.module.css";
import AddUserModal from "./AddUserModal";
import UpdateUserModal from "./UpdateUserModal";
import ChangePasswordModal from "./ChangePasswordModal";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchUsers = async (page = 1) => {
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
      if (roleFilter) params.append('role', roleFilter);

      const url = `${API_BASE}/api/admin/users?${params}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Lấy user ID từ localStorage hoặc token
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserId(user._id || user.id);
    }
  }, []);

  const handleEdit = (user) => {
    setEditUser(user);
    setShowEditModal(true);
  };

  const handleChangePassword = (user) => {
    // Chỉ cho phép admin đổi mật khẩu chính mình
    if (user._id !== currentUserId) {
      alert('Bạn chỉ có thể đổi mật khẩu của chính mình');
      return;
    }
    setEditUser(user);
    setShowPasswordModal(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Xóa user "${user.username}"?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/users/${user._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete user');
        }

        fetchUsers(currentPage);
      } catch (err) {
        alert('Lỗi khi xóa user: ' + err.message);
      }
    }
  };

  const handleSearch = () => {
    fetchUsers(1);
  };

  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Users</h1>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          + Thêm User
        </button>
      </div>

      {/* Search and Filter */}
      <div className={styles.searchFilter}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Tìm kiếm theo username, email, tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Tìm kiếm</button>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Tất cả roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {error && (
        <div style={{ 
          background: '#fef2f2', 
          color: '#dc2626', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '16px',
          border: '1px solid #fecaca'
        }}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#dc2626', 
              float: 'right',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <p className={styles.loading}>Đang tải...</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Tên đầy đủ</th>
                  <th>Role</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={styles.empty}>Không có dữ liệu</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.fullName || '-'}</td>
                      <td>
                        <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button 
                          className={styles.editBtn}
                          onClick={() => handleEdit(user)}
                        >
                          Sửa
                        </button>
                        {/* Chỉ hiển thị nút Đổi MK cho chính mình */}
                        {currentUserId === user._id && (
                          <button 
                            className={styles.passwordBtn}
                            onClick={() => handleChangePassword(user)}
                          >
                            Đổi MK
                          </button>
                        )}
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(user)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                disabled={!pagination.hasPrev}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Trước
              </button>
              <span>
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button 
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showModal && (
        <AddUserModal 
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchUsers(currentPage);
          }}
        />
      )}

      {showEditModal && editUser && (
        <UpdateUserModal 
          user={editUser}
          onClose={() => {
            setShowEditModal(false);
            setEditUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditUser(null);
            fetchUsers(currentPage);
          }}
        />
      )}

      {showPasswordModal && editUser && (
        <ChangePasswordModal 
          user={editUser}
          onClose={() => {
            setShowPasswordModal(false);
            setEditUser(null);
          }}
          onSuccess={() => {
            setShowPasswordModal(false);
            setEditUser(null);
          }}
        />
      )}
    </div>
  );
}
