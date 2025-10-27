import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ForgotPasswordPage.module.css';

import BackIcon from '../../components/icons/BackIcon';
import OTPModal from '../../../components/OTPModal/OTPModal';
import { sendOTP, verifyOTP, checkEmailExists } from '../../../services/otpService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(email);
      setSuccess('OTP đã được gửi đến email của bạn');
      setShowOTPModal(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      const result = await verifyOTP(email, otp);
      // Tạo token reset password và chuyển đến trang đặt lại mật khẩu
      const resetToken = result.resetToken || 'temp-token'; // Backend sẽ trả về token
      setShowOTPModal(false);
      // Chuyển đến trang đặt lại mật khẩu với token
      window.location.href = `/reset-password/${resetToken}`;
    } catch (error) {
      throw error;
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendOTP(email);
      alert('OTP đã được gửi lại đến email của bạn');
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className={styles.forgotPasswordPage}>
      <div className={styles.forgotPassword}>
        <div className={styles.forgotPassword__card}>
          <Link to="/login" className={styles.forgotPassword__back}>
            <BackIcon className={styles.forgotPassword__backIcon} />
            <span>Về trang đăng nhập</span>
          </Link>

          <h1 className={styles.forgotPassword__title}>Quên mật khẩu</h1>

          <div className={styles.forgotPassword__container}>
            {error && <div className={styles.forgotPassword__alertError}>{error}</div>}
            {success && <div className={styles.forgotPassword__alertSuccess}>{success}</div>}

            <form className={styles.forgotPassword__form} onSubmit={handleSubmit}>
              <p className={styles.forgotPassword__description}>
                Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
              </p>
              
              <input
                type="email"
                name="email"
                placeholder="Email của bạn *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <button
                type="submit"
                className={styles.forgotPassword__btn}
                disabled={loading || !email.trim()}
              >
                {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </form>

            <div className={styles.forgotPassword__footnote}>
              Nhớ mật khẩu?{' '}
              <Link to="/login" className={styles.forgotPassword__link}>
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={email}
        onVerifyOTP={handleVerifyOTP}
        onResendOTP={handleResendOTP}
      />
    </div>
  );
}
