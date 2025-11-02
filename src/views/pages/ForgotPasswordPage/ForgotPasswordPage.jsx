// ForgotPasswordPage.jsx
import { Link } from 'react-router-dom';
import styles from './ForgotPasswordPage.module.css';
import BackIcon from '../../components/icons/BackIcon';
import { useForgotPasswordViewModel } from '../../../viewmodels/AuthViewModel/ForgotPasswordViewModel';

export default function ForgotPasswordPage() {
  const {
    step,
    email,
    otp,
    newPassword,
    confirmPassword,
    loading,
    sendingOTP,
    err,
    ok,
    countdown,
    onEmailChange,
    onOtpChange,
    onPasswordChange,
    handleSubmit,
    handleResendOTP,
    handleBack,
  } = useForgotPasswordViewModel();
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

          <h1 className={styles.forgotPassword__title}>QUÊN MẬT KHẨU</h1>

          {err && <div className={styles.forgotPassword__alertError}>{err}</div>}
          {ok && <div className={styles.forgotPassword__alertSuccess}>{ok}</div>}

          <div className={styles.forgotPassword__container}>
            {step === 1 ? (
              // Bước 1: Nhập email
              <form
                className={styles.forgotPassword__form}
                onSubmit={handleSubmit}
                noValidate
              >
                <p className={styles.forgotPassword__instruction}>
                  Vui lòng nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
                </p>

                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  value={email}
                  onChange={onEmailChange}
                  required
                  autoFocus
                />

                <button
                  type="submit"
                  className={`${styles.forgotPassword__btn} ${
                    sendingOTP ? styles['forgotPassword__btn--disabled'] : ''
                  }`}
                  disabled={sendingOTP}
                >
                  {sendingOTP ? 'Đang gửi OTP...' : 'Gửi mã OTP'}
                </button>
              </form>
            ) : (
              // Bước 2: Nhập OTP và mật khẩu mới
              <form
                className={styles.forgotPassword__form}
                onSubmit={handleSubmit}
                noValidate
              >
                <div className={styles.otpSection}>
                  <p className={styles.otpInstruction}>
                    Mã OTP đã được gửi đến email <strong>{email}</strong>
                  </p>
                  <p className={styles.otpHint}>
                    Vui lòng nhập mã OTP và mật khẩu mới
                  </p>

                  <input
                    type="text"
                    name="otp"
                    placeholder="Nhập mã OTP (6 số)"
                    value={otp}
                    onChange={onOtpChange}
                    className={styles.otpInput}
                    maxLength={6}
                    required
                    autoFocus
                  />

                  <div className={styles.resendOTP}>
                    {countdown > 0 ? (
                      <span className={styles.countdown}>
                        Gửi lại sau {countdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className={styles.resendBtn}
                        disabled={sendingOTP}
                      >
                        {sendingOTP ? 'Đang gửi...' : 'Gửi lại OTP'}
                      </button>
                    )}
                  </div>

                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Mật khẩu mới *"
                    value={newPassword}
                    onChange={onPasswordChange}
                    required
                    minLength={6}
                  />

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu mới *"
                    value={confirmPassword}
                    onChange={onPasswordChange}
                    required
                    minLength={6}
                  />

                  <button
                    type="submit"
                    className={`${styles.forgotPassword__btn} ${
                      loading || otp.length !== 6 || !newPassword || !confirmPassword
                        ? styles['forgotPassword__btn--disabled']
                        : ''
                    }`}
                    disabled={loading || otp.length !== 6 || !newPassword || !confirmPassword}
                  >
                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                  </button>

                  <button
                    type="button"
                    onClick={handleBack}
                    className={styles.backBtn}
                  >
                    ← Quay lại
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className={styles.forgotPassword__footnote}>
            Đã nhớ mật khẩu?{' '}
            <Link to="/login" className={styles.forgotPassword__link}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

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
