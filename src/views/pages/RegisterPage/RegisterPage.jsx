// RegisterPage.jsx
import { Link } from 'react-router-dom';
import styles from './RegisterPage.module.css';
import BackIcon from '../../components/icons/BackIcon';
import FacebookIcon from '../../components/icons/FacebookIcon';
import GoogleIcon from '../../components/icons/GoogleIcon';
import OTPModal from '../../../components/OTPModal/OTPModal';
import { useRegisterViewModel } from '../../../viewmodels/AuthViewModel/RegisterViewModel';

export default function RegisterPage() {
  const {
    form,
    agree,
    loading,
    err,
    ok,
    showOTPModal,
    onChange,
    setAgree,
    handleSubmit,
    // OTP related
    step,
    otp,
    sendingOTP,
    countdown,
    onOtpChange,
    handleResendOTP,
    handleBackToForm,
    handleVerifyOTP,
    handleCloseOTPModal,
  } = useRegisterViewModel();

  return (
    <div className={styles.registerPage}>
      <div className={styles.register}>
        <div className={styles.register__card}>
          <Link to='/' className={styles.register__back}>
            <BackIcon className={styles.register__backIcon} />
            <span>Về trang chủ</span>
          </Link>

          <h1 className={styles.register__title}>ĐĂNG KÝ TÀI KHOẢN</h1>

          {err && <div className={styles.register__alertError}>{err}</div>}
          {ok && <div className={styles.register__alertSuccess}>{ok}</div>}

          <div className={styles.register__container}>
            {step === 1 ? (
              // Bước 1: Nhập thông tin đăng ký
              <>
                <form
                  className={styles.register__form}
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <input type="text" name="username" placeholder="Tên tài khoản *"
                    value={form.username} onChange={onChange} required />
                  <input type="email" name="email" placeholder="Email *"
                    value={form.email} onChange={onChange} required />
                  <input type="text" name="fullName" placeholder="Họ và tên *"
                    value={form.fullName} onChange={onChange} required />
                  <input type="text" name="address" placeholder="Địa chỉ *"
                    value={form.address} onChange={onChange} required />
                  <input type="tel" name="phone" placeholder="Số điện thoại *"
                    value={form.phone} onChange={onChange} required />
                  <input type="password" name="password" placeholder="Mật khẩu *"
                    value={form.password} onChange={onChange} required />
                  <input type="password" name="confirm" placeholder="Nhập lại mật khẩu *"
                    value={form.confirm} onChange={onChange} required />

                  <div className={styles.register__terms}>
                    <input id="agree" type="checkbox"
                      checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    <label htmlFor="agree">
                      Đồng ý với <strong>Điều khoản</strong> và <strong>Điều kiện</strong>
                    </label>
                  </div>

                  <button type="submit"
                    className={`${styles.register__btn} ${
                      !agree || sendingOTP ? styles['register__btn--disabled'] : ''
                    }`}
                    disabled={!agree || sendingOTP}
                  >
                    {sendingOTP ? 'Đang gửi OTP...' : 'Gửi mã OTP'}
                  </button>
                </form>

                <div className={styles.register__divider} />

                <div className={styles.register__social}>
                  <p className={styles.register__socialTitle}>Đăng ký bằng</p>
                  <button type="button" className={`${styles.register__btnSocial} ${styles.facebook}`} disabled>
                    <FacebookIcon className={styles.register__icon} />
                    <span>Facebook (sắp có)</span>
                  </button>
                  <button type="button" className={`${styles.register__btnSocial} ${styles.google}`} disabled>
                    <GoogleIcon className={styles.register__icon} />
                    <span>Google (sắp có)</span>
                  </button>
                </div>
              </>
            ) : (
              // Bước 2: Nhập OTP
              <form
                className={styles.register__form}
                onSubmit={handleSubmit}
                noValidate
              >
                <div className={styles.otpSection}>
                  <p className={styles.otpInstruction}>
                    Mã OTP đã được gửi đến email <strong>{form.email}</strong>
                  </p>
                  <p className={styles.otpHint}>
                    Vui lòng kiểm tra hộp thư và nhập mã OTP 6 số
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

                  <button type="submit"
                    className={`${styles.register__btn} ${
                      loading || otp.length !== 6 ? styles['register__btn--disabled'] : ''
                    }`}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? 'Đang xử lý...' : 'Xác thực và đăng ký'}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToForm}
                    className={styles.backBtn}
                  >
                    ← Quay lại sửa thông tin
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className={styles.register__footnote}>
            Đã có tài khoản?{' '}
            <Link to="/login" className={styles.register__link}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={handleCloseOTPModal}
        email={form.email}
        onVerifyOTP={handleVerifyOTP}
        onResendOTP={handleResendOTP}
      />
    </div>
  );
}
