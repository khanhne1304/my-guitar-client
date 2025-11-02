import { useState } from "react";
import styles from "./UserManager.module.css";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:4000';

export default function AddUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    address: '',
    phone: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Thêm User Mới</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Mật khẩu *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Tên đầy đủ</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Địa chỉ</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Số điện thoại</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
