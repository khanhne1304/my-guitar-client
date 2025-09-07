// RegisterViewModel.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm, User } from '../../../src/models/AuthModels/registerModel';
import { validateRegister } from '../../utils/validators';
import { saveSession } from '../../utils/storage';
import { register as apiRegister, login as apiLogin } from '../../services/authService';

export function useRegisterViewModel() {
  const navigate = useNavigate();

  const [form, setForm] = useState(new RegisterForm());
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

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
      // 1. Đăng ký
      await apiRegister({
        username: form.username.trim(),
        name: form.fullName.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      // 2. Đăng nhập tự động
      const identifier = form.email.trim() || form.username.trim();
      const loginData = await apiLogin({
        identifier,
        password: form.password,
      });

      const backendUser = loginData?.user || {};
      const user = new User({
        id: backendUser.id ?? backendUser._id,
        name: backendUser.name ?? form.fullName.trim(),
        email: backendUser.email ?? form.email.trim(),
        username: backendUser.username ?? form.username.trim(),
        phone: backendUser.phone ?? form.phone.trim(),
        address: backendUser.address ?? form.address.trim(),
        createdAt: backendUser.createdAt ?? new Date().toISOString(),
      });

      saveSession({ token: loginData?.token, user });
      setOk('Đăng ký & đăng nhập thành công!');
      setTimeout(() => navigate('/'), 700);
    } catch (error) {
      const message =
        error?.name === 'TypeError' &&
        String(error?.message || '').includes('fetch')
          ? 'Không thể kết nối đến server. Vui lòng thử lại sau.'
          : error?.data?.message ||
            (Array.isArray(error?.data?.errors) &&
              error.data.errors.map((e) => e?.msg || e).join('; ')) ||
            error?.message ||
            'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    agree,
    loading,
    err,
    ok,
    onChange,
    setAgree,
    handleSubmit,
  };
}
