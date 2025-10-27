import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './ResetPasswordPage.module.css';

import BackIcon from '../../components/icons/BackIcon';
import { resetPasswordWithToken } from '../../../services/otpService';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithToken(token, formData.newPassword);
      setSuccess('Mật khẩu đã được đặt lại thành công! Đang chuyển về trang đăng nhập...');
      
      // Chuyển về trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.resetPasswordPage}>
      <div className={styles.resetPassword}>
        <div className={styles.resetPassword__card}>
          <Link to="/login" className={styles.resetPassword__back}>
            <BackIcon className={styles.resetPassword__backIcon} />
            <span>Về trang đăng nhập</span>
          </Link>

          <h1 className={styles.resetPassword__title}>Đặt lại mật khẩu</h1>

          <div className={styles.resetPassword__container}>
            {error && <div className={styles.resetPassword__alertError}>{error}</div>}
            {success && <div className={styles.resetPassword__alertSuccess}>{success}</div>}

            <form className={styles.resetPassword__form} onSubmit={handleSubmit}>
              <p className={styles.resetPassword__description}>
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>
              
              <div className={styles.resetPassword__inputGroup}>
                <label htmlFor="newPassword">Mật khẩu mới *</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  placeholder="Nhập mật khẩu mới"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>

              <div className={styles.resetPassword__inputGroup}>
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
              
              <button
                type="submit"
                className={styles.resetPassword__btn}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>

            <div className={styles.resetPassword__footnote}>
              Nhớ mật khẩu?{' '}
              <Link to="/login" className={styles.resetPassword__link}>
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
