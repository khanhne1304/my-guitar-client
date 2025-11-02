// RegisterViewModel.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm, User } from '../../../src/models/AuthModels/registerModel';
import { validateRegister } from '../../utils/validators';
import { saveSession } from '../../utils/storage';
import { sendOTPForRegister, verifyOTPAndRegister } from '../../services/authService';

export function useRegisterViewModel() {
  const navigate = useNavigate();

  const [form, setForm] = useState(new RegisterForm());
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  // OTP states
  const [step, setStep] = useState(1); // 1: nhập thông tin, 2: nhập OTP
  const [otp, setOtp] = useState('');
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép số
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  // Gửi OTP
  async function handleSendOTP(e) {
    e.preventDefault();
    setErr('');
    setOk('');

    // Validate thông tin cơ bản (không cần OTP ở bước này)
    const msg = validateRegister(form, agree);
    if (msg) return setErr(msg);

    setSendingOTP(true);
    try {
      await sendOTPForRegister(form.email.trim());
      setOtpSent(true);
      setStep(2);
      setOk('OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
      
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
        'Không thể gửi OTP. Vui lòng thử lại.';
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
      await sendOTPForRegister(form.email.trim());
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

  // Xác thực OTP và đăng ký
  async function handleVerifyOTPAndRegister(e) {
    e.preventDefault();
    setErr('');
    setOk('');

    if (!otp || otp.length !== 6) {
      return setErr('Vui lòng nhập đầy đủ mã OTP 6 số.');
    }

    setLoading(true);
    try {
      // Xác thực OTP và đăng ký tài khoản
      const result = await verifyOTPAndRegister({
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        password: form.password,
        otp: otp,
      });

      const backendUser = result?.user || result?.data?.user || {};
      const user = new User({
        id: backendUser.id ?? backendUser._id,
        name: backendUser.fullName ?? backendUser.name ?? form.fullName.trim(),
        email: backendUser.email ?? form.email.trim(),
        username: backendUser.username ?? form.username.trim(),
        phone: backendUser.phone ?? form.phone.trim(),
        address: backendUser.address ?? form.address.trim(),
        createdAt: backendUser.createdAt ?? new Date().toISOString(),
      });

      saveSession({ token: result?.token || result?.data?.token, user });
      setOk('Đăng ký thành công! Đang chuyển hướng...');
      setShowOTPModal(false);
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.message ||
        'Xác thực OTP thất bại. Vui lòng thử lại.';
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(otp) {
    try {
      // Xác thực OTP và đăng ký tài khoản
      const result = await verifyOTPAndRegister({
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        password: form.password,
        otp: otp,
      });

      const backendUser = result?.user || result?.data?.user || {};
      const user = new User({
        id: backendUser.id ?? backendUser._id,
        name: backendUser.fullName ?? backendUser.name ?? form.fullName.trim(),
        email: backendUser.email ?? form.email.trim(),
        username: backendUser.username ?? form.username.trim(),
        phone: backendUser.phone ?? form.phone.trim(),
        address: backendUser.address ?? form.address.trim(),
        createdAt: backendUser.createdAt ?? new Date().toISOString(),
      });

      saveSession({ token: result?.token || result?.data?.token, user });
      setOk('Đăng ký thành công! Đang chuyển về trang chủ...');
      setShowOTPModal(false);
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      const message = error?.message || 'Xác thực OTP thất bại. Vui lòng thử lại.';
      throw new Error(message);
    }
  }

  // Quay lại bước nhập thông tin
  function handleBackToForm() {
    setStep(1);
    setOtp('');
    setOtpSent(false);
    setCountdown(0);
    setErr('');
    setOk('');
  }

  // handleSubmit chuyển thành handleSendOTP hoặc handleVerifyOTPAndRegister tùy theo step
  const handleSubmit = step === 1 ? handleSendOTP : handleVerifyOTPAndRegister;

  function handleCloseOTPModal() {
    setShowOTPModal(false);
    setOk(''); // Xóa thông báo thành công
  }

  return {
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
    otpSent,
    countdown,
    onOtpChange,
    handleResendOTP,
    handleBackToForm,
    handleVerifyOTP,
    handleCloseOTPModal,
  };
}
