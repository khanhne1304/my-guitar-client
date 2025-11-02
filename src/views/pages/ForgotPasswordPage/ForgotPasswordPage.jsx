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
