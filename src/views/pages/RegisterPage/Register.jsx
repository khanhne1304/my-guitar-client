// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

import BackIcon from './../../components/icons/BackIcon';
import FacebookIcon from './../../components/icons/FacebookIcon';
import GoogleIcon from './../../components/icons/GoogleIcon';

import {
  register as apiRegister,
  login as apiLogin,
} from '../../../services/authService';
import { validateRegister } from '../../../utils/validators';
import { saveSession } from '../../../utils/storage';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    fullName: '',
    address: '',
    phone: '',
    password: '',
    confirm: '',
  });
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
      // 1) Đăng ký (dùng fullName làm name cho backend)
      await apiRegister({
        name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      // 2) Đăng nhập tự động
      const loginData = await apiLogin({
        email: form.email.trim(),
        password: form.password,
      });

      const token = loginData?.token;
      const backendUser = loginData?.user || {};

      // 3) Ghép user từ backend + form
      const mergedUser = {
        id: backendUser.id ?? backendUser._id,
        name: backendUser.name ?? form.fullName?.trim() ?? '',
        email: backendUser.email ?? form.email?.trim() ?? '',
        username: backendUser.username ?? form.username?.trim() ?? '',
        phone: backendUser.phone ?? form.phone?.trim() ?? '',
        address: backendUser.address ?? form.address?.trim() ?? '',
        createdAt: backendUser.createdAt ?? new Date().toISOString(),
      };

      // 4) Lưu session
      saveSession({ token, user: mergedUser });

      setOk('Đăng ký & đăng nhập thành công!');
      // Điều hướng: đưa thẳng về trang chủ hoặc /login tuỳ flow
      setTimeout(() => navigate('/login'), 500);
    } catch (error) {
      const message =
        error?.name === 'TypeError' &&
        String(error?.message || '').includes('fetch')
          ? 'Không thể kết nối đến server. Vui lòng thử lại sau.'
          : error?.message || 'Đã có lỗi xảy ra.';
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

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
            <form className={styles.register__form} onSubmit={handleSubmit}>
              <input
                type='text'
                name='username'
                placeholder='Tên tài khoản (tuỳ chọn)'
                value={form.username}
                onChange={onChange}
                autoComplete='username'
              />
              <input
                type='email'
                name='email'
                placeholder='Email'
                value={form.email}
                onChange={onChange}
                autoComplete='email'
                required
              />
              <input
                type='text'
                name='fullName'
                placeholder='Họ và tên'
                value={form.fullName}
                onChange={onChange}
                required
              />
              <input
                type='text'
                name='address'
                placeholder='Địa chỉ (tuỳ chọn)'
                value={form.address}
                onChange={onChange}
                autoComplete='street-address'
              />
              <input
                type='text'
                name='phone'
                placeholder='Số điện thoại (tuỳ chọn)'
                value={form.phone}
                onChange={onChange}
                autoComplete='tel'
              />
              <input
                type='password'
                name='password'
                placeholder='Mật khẩu'
                value={form.password}
                onChange={onChange}
                autoComplete='new-password'
                required
              />
              <input
                type='password'
                name='confirm'
                placeholder='Nhập lại mật khẩu'
                value={form.confirm}
                onChange={onChange}
                autoComplete='new-password'
                required
              />

              <div className={styles.register__terms}>
                <input
                  id='agree'
                  type='checkbox'
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <label htmlFor='agree'>
                  Đồng ý với <strong>Điều khoản</strong> và{' '}
                  <strong>Điều kiện</strong>
                </label>
              </div>

              <button
                type='submit'
                className={`${styles.register__btn} ${
                  !agree || loading ? styles['register__btn--disabled'] : ''
                }`}
                disabled={!agree || loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </form>

            <div className={styles.register__divider} aria-hidden='true' />

            <div className={styles.register__social}>
              <p className={styles.register__socialTitle}>Đăng ký bằng</p>
              <button
                type='button'
                className={`${styles.register__btnSocial} ${styles.facebook}`}
                disabled
              >
                <FacebookIcon className={styles.register__icon} />
                <span>Facebook (sắp có)</span>
              </button>
              <button
                type='button'
                className={`${styles.register__btnSocial} ${styles.google}`}
                disabled
              >
                <GoogleIcon className={styles.register__icon} />
                <span>Google (sắp có)</span>
              </button>
            </div>
          </div>

          <div className={styles.register__footnote}>
            Đã có tài khoản?{' '}
            <Link to='/login' className={styles.register__link}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
