// LoginView.jsx
import { Link } from 'react-router-dom';
import styles from './LoginPage.module.css';

import BackIcon from '../../components/icons/BackIcon';
import FacebookIcon from '../../components/icons/FacebookIcon';
import GoogleIcon from '../../components/icons/GoogleIcon';
import { useLoginViewModel } from '../../../viewmodels/AuthViewModel/LoginViewModel';

export default function LoginPage() {
  const { form, err, ok, loading, onChange, onSubmit } = useLoginViewModel();

  return (
    <div className={styles.loginPage}>
      <div className={styles.login}>
        <div className={styles.login__card}>
          <Link to="/" className={styles.login__back}>
            <BackIcon className={styles.login__backIcon} />
            <span>Về trang chủ</span>
          </Link>

          <h1 className={styles.login__title}>Đăng nhập</h1>

          {err && <div className={styles.login__alertError}>{err}</div>}
          {ok && <div className={styles.login__alertSuccess}>{ok}</div>}

          <div className={styles.login__container}>
            <form className={styles.login__form} onSubmit={onSubmit}>
              <input
                type="text"
                name="identifier"
                placeholder="Email hoặc Username"
                value={form.identifier}
                onChange={onChange}
                autoComplete="username"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
                required
              />
              <button
                type="submit"
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
              type="button"
              className={`${styles.login__btnSocial} ${styles.facebook}`}
              disabled
            >
              <FacebookIcon className={styles.login__icon} />
              <span>Facebook (sắp có)</span>
            </button>
            <button
              type="button"
              className={`${styles.login__btnSocial} ${styles.google}`}
              disabled
            >
              <GoogleIcon className={styles.login__icon} />
              <span>Google (sắp có)</span>
            </button>

            <div className={styles.login__footnote}>
              Chưa có tài khoản?{' '}
              <Link to="/register" className={styles.login__link}>
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
