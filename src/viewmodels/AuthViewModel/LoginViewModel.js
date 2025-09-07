// LoginViewModel.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../../services/authService';
import { setToken, getUser, setUser, mergeUser } from '../../utils/storage';
import { LoginForm } from '../../models/AuthModels/loginModel';

export function useLoginViewModel() {
  const navigate = useNavigate();

  const [form, setForm] = useState(new LoginForm());
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');

    if (!form.identifier || !form.password) {
      setErr('Vui lòng nhập email/username và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const data = await apiLogin({
        identifier: form.identifier,
        password: form.password,
      });

      if (data?.token) setToken(data.token);

      const existingUser = getUser() || null;
      const merged = mergeUser(data?.user, existingUser);

      if (!merged.email && form.identifier.includes('@')) {
        merged.email = form.identifier.trim();
      }
      if (!merged.username && !form.identifier.includes('@')) {
        merged.username = form.identifier.trim();
      }

      setUser(merged);

      setOk('Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/'), 800);
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    err,
    ok,
    loading,
    onChange,
    onSubmit,
  };
}
