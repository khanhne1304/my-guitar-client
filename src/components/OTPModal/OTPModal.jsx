import { useState, useRef, useEffect } from 'react';
import styles from './OTPModal.module.css';

export default function OTPModal({ isOpen, onClose, email, onVerifyOTP, onResendOTP }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setCountdown(60); // 60 giây countdown
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return; // Chỉ cho phép 1 ký tự
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Tự động chuyển sang ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 số OTP');
      return;
    }

    setLoading(true);
    try {
      await onVerifyOTP(otpString);
    } catch (error) {
      setError(error.message || 'OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await onResendOTP();
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      setError('');
    } catch (error) {
      setError(error.message || 'Không thể gửi lại OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Xác thực OTP</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>
            Chúng tôi đã gửi mã OTP 6 số đến email:
          </p>
          <p className={styles.email}>{email}</p>
          <p className={styles.note}>
            Vui lòng kiểm tra hộp thư và nhập mã OTP bên dưới
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.otpContainer}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={styles.otpInput}
                  disabled={loading}
                />
              ))}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
              type="submit"
              className={styles.verifyBtn}
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
            </button>
          </form>

          <div className={styles.resendContainer}>
            {countdown > 0 ? (
              <p className={styles.countdown}>
                Gửi lại sau {countdown} giây
              </p>
            ) : (
              <button
                className={styles.resendBtn}
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? 'Đang gửi...' : 'Gửi lại OTP'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


