// src/pages/Auth/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

import BackIcon from '../../components/icons/BackIcon';
import FacebookIcon from '../../components/icons/FacebookIcon';
import GoogleIcon from '../../components/icons/GoogleIcon';

import { login as apiLogin } from '../../../services/authService';
import { setToken, getUser, setUser, mergeUser } from '../../../utils/storage';

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // thay cho email
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');

    if (!identifier || !password) {
      setErr('Vui lòng nhập email/username và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      // gọi API với identifier
      const data = await apiLogin({ identifier, password });

      if (data?.token) setToken(data.token);

      const existingUser = getUser() || null;
      const merged = mergeUser(data?.user, existingUser);
      if (!merged.email && identifier.includes('@')) {
        merged.email = identifier.trim();
      }
      if (!merged.username && !identifier.includes('@')) {
        merged.username = identifier.trim();
      }
      setUser(merged);

      setOk('Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/'), 800);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.login}>
        <div className={styles.login__card}>
          <Link to='/' className={styles.login__back}>
            <BackIcon className={styles.login__backIcon} />
            <span>Về trang chủ</span>
          </Link>

          <h1 className={styles.login__title}>Đăng nhập</h1>

          {err && <div className={styles.login__alertError}>{err}</div>}
          {ok && <div className={styles.login__alertSuccess}>{ok}</div>}

          <div className={styles.login__container}>
            <form className={styles.login__form} onSubmit={onSubmit}>
              <input
                type='text'
                placeholder='Email hoặc Username'
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete='username'
                required
              />
              <input
                type='password'
                placeholder='Mật khẩu'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='current-password'
                required
              />
              <button
                type='submit'
                className={styles.login__btn}
                disabled={loading}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className={styles.login__separator}>
              <span>Đăng nhập bằng</span>
            </div>

            <button
              type='button'
              className={`${styles.login__btnSocial} ${styles.facebook}`}
              disabled
            >
              <FacebookIcon className={styles.login__icon} />
              <span>Facebook (sắp có)</span>
            </button>
            <button
              type='button'
              className={`${styles.login__btnSocial} ${styles.google}`}
              disabled
            >
              <GoogleIcon className={styles.login__icon} />
              <span>Google (sắp có)</span>
            </button>

            <div className={styles.login__footnote}>
              Chưa có tài khoản?{' '}
              <Link to='/register' className={styles.login__link}>
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
