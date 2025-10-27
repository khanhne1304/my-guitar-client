// RegisterViewModel.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm, User } from '../../../src/models/AuthModels/registerModel';
import { validateRegister } from '../../utils/validators';
import { saveSession } from '../../utils/storage';
import { register as apiRegister, login as apiLogin } from '../../services/authService';
import { sendOTPForRegister, verifyOTPAndRegister } from '../../services/otpService';

export function useRegisterViewModel() {
  const navigate = useNavigate();

  const [form, setForm] = useState(new RegisterForm());
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setOk('');

    const msg = validateRegister(form, agree);
    if (msg) return setErr(msg);

    setLoading(true);
    try {
      // 1. Gửi OTP đến email
      await sendOTPForRegister(form.email.trim());
      setOk('Mã OTP đã được gửi đến email của bạn');
      setShowOTPModal(true);
    } catch (error) {
      const message = error?.message || 'Không thể gửi OTP. Vui lòng thử lại.';
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(otp) {
    try {
      // 1. Xác thực OTP và đăng ký tài khoản
      const result = await verifyOTPAndRegister({
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        password: form.password,
      }, otp);

      console.log('Frontend result:', result);
      console.log('Frontend result.user:', result.user);
      console.log('Frontend result.user.id:', result.user?.id);
      console.log('Frontend result.user._id:', result.user?._id);

      // 2. Lưu session
      if (!result || !result.user) {
        console.log('Missing result or user:', { result: !!result, user: !!result?.user });
        throw new Error('Dữ liệu phản hồi không hợp lệ');
      }

      const user = new User({
        id: result.user._id || result.user.id,
        name: result.user.fullName,
        email: result.user.email,
        username: result.user.username,
        phone: result.user.phone,
        address: result.user.address,
        createdAt: result.user.createdAt,
      });

      saveSession({ token: result.token, user });
      setOk('Đăng ký thành công! Đang chuyển về trang chủ...');
      setShowOTPModal(false);
      
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      const message = error?.message || 'Xác thực OTP thất bại. Vui lòng thử lại.';
      throw new Error(message);
    }
  }

  async function handleResendOTP() {
    try {
      await sendOTPForRegister(form.email.trim());
      alert('Mã OTP đã được gửi lại đến email của bạn');
    } catch (error) {
      throw new Error(error?.message || 'Không thể gửi lại OTP');
    }
  }

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
    handleVerifyOTP,
    handleResendOTP,
    handleCloseOTPModal,
  };
}
