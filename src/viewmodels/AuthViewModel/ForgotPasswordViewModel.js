// ForgotPasswordViewModel.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTPForResetPassword, resetPasswordWithOTP } from '../../services/authService';

export function useForgotPasswordViewModel() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP và mật khẩu mới
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [countdown, setCountdown] = useState(0);

  const onEmailChange = (e) => setEmail(e.target.value.trim());
  
  const onOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép số
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const onPasswordChange = (e) => {
    if (e.target.name === 'newPassword') {
      setNewPassword(e.target.value);
    } else {
      setConfirmPassword(e.target.value);
    }
  };

  // Bước 1: Gửi OTP
  async function handleSendOTP(e) {
    e.preventDefault();
    setErr('');
    setOk('');

    if (!email) {
      return setErr('Vui lòng nhập email.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setErr('Email không hợp lệ.');
    }

    setSendingOTP(true);
    try {
      await sendOTPForResetPassword(email);
      setOk('OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
      setStep(2);
      
      // Đếm ngược 60 giây
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.message ||
        'Không thể gửi OTP. Vui lòng kiểm tra email và thử lại.';
      setErr(message);
    } finally {
      setSendingOTP(false);
    }
  }

  // Gửi lại OTP
  async function handleResendOTP() {
    if (countdown > 0) return;
    
    setErr('');
    setSendingOTP(true);
    try {
      await sendOTPForResetPassword(email);
      setOk('OTP mới đã được gửi đến email của bạn.');
      
      // Đếm ngược lại
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.message ||
        'Không thể gửi lại OTP. Vui lòng thử lại.';
      setErr(message);
    } finally {
      setSendingOTP(false);
    }
  }

  // Bước 2: Xác thực OTP và nhập mật khẩu mới
  async function handleVerifyOTPAndReset(e) {
    e.preventDefault();
    setErr('');
    setOk('');

    if (!otp || otp.length !== 6) {
      return setErr('Vui lòng nhập đầy đủ mã OTP 6 số.');
    }

    if (!newPassword) {
      return setErr('Vui lòng nhập mật khẩu mới.');
    }

    if (newPassword.length < 6) {
      return setErr('Mật khẩu phải có ít nhất 6 ký tự.');
    }

    if (newPassword !== confirmPassword) {
      return setErr('Mật khẩu nhập lại không khớp.');
    }

    setLoading(true);
    try {
      await resetPasswordWithOTP(email, otp, newPassword);
      setOk('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.message ||
        'OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.';
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  // Quay lại bước trước
  function handleBack() {
    if (step === 2) {
      setStep(1);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setCountdown(0);
    }
    setErr('');
    setOk('');
  }

  // handleSubmit tùy theo step
  const handleSubmit = step === 1 ? handleSendOTP : handleVerifyOTPAndReset;

  return {
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
  };
}

