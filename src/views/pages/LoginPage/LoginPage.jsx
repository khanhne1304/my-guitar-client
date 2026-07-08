// LoginPage.jsx
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import styles from './LoginPage.module.css';
import BackIcon from '../../components/icons/BackIcon';
import FacebookIcon from '../../components/icons/FacebookIcon';
import GoogleIcon from '../../components/icons/GoogleIcon';
import { useLoginViewModel } from '../../../viewmodels/AuthViewModel/LoginViewModel';
import { apiClient } from '../../../services/apiClient';
import { useAuth } from '../../../context/AuthContext';
import { getUser } from '../../../utils/storage';
import Footer from '../../components/homeItem/Footer/Footer';
import AdminRoleChoice from '../../components/auth/AdminRoleChoice/AdminRoleChoice';

export default function LoginPage() {
  const {
    form,
    err,
    ok,
    loading,
    showRoleChoice,
    onChange,
    onSubmit,
    continueAsCustomer,
    continueAsAdmin,
  } = useLoginViewModel();
  const { isAuthenticated, authChecked } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lockedMsg, setLockedMsg] = useState('');
  const hadRoleChoiceRef = useRef(false);

  useEffect(() => {
    if (showRoleChoice) {
      hadRoleChoiceRef.current = true;
    }
  }, [showRoleChoice]);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'locked') {
      const msg = searchParams.get('message');
      if (msg) {
        setLockedMsg(decodeURIComponent(msg));
      } else {
        setLockedMsg('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }
      return;
    }
    if (err === 'facebook' || err === 'google') {
      setLockedMsg('Đăng nhập mạng xã hội thất bại. Vui lòng thử lại.');
      return;
    }
    if (err === 'oauth') {
      const msg = searchParams.get('message');
      setLockedMsg(msg ? decodeURIComponent(msg) : 'Không thể hoàn tất đăng nhập. Vui lòng thử lại.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authChecked || !isAuthenticated || showRoleChoice || hadRoleChoiceRef.current) {
      return;
    }

    const user = getUser();
    if (
      user?.role === 'admin' &&
      sessionStorage.getItem('oauth_pending_admin_choice') === '1'
    ) {
      navigate('/auth/callback', { replace: true });
      return;
    }

    navigate('/', { replace: true });
  }, [authChecked, isAuthenticated, navigate, showRoleChoice]);
  const onLoginWithFacebook = () => {
    const startUrl = apiClient.ensureAbsolute('/api/auth/facebook');
    window.location.href = startUrl;
  };
  const onLoginWithGoogle = () => {
    const startUrl = apiClient.ensureAbsolute('/api/auth/google');
    window.location.href = startUrl;
  };

  return (
    <>
      <div className={styles.loginPage}>
        <div className={styles.login}>
          <div className={styles.login__card}>
            <Link to="/" className={styles.login__back}>
              <BackIcon className={styles.login__backIcon} />
              <span>Về trang chủ</span>
            </Link>

            <h1 className={styles.login__title}>ĐĂNG NHẬP</h1>

            {lockedMsg && <div className={styles.login__alertError}>{lockedMsg}</div>}
            {err && <div className={styles.login__alertError}>{err}</div>}
            {ok && !showRoleChoice && <div className={styles.login__alertSuccess}>{ok}</div>}

            {showRoleChoice ? (
              <div className={styles.login__container}>
                {ok && <div className={styles.login__alertSuccess}>{ok}</div>}
                <AdminRoleChoice
                  onContinueAsCustomer={continueAsCustomer}
                  onContinueAsAdmin={continueAsAdmin}
                />
              </div>
            ) : (
            <div className={styles.login__container}>
              <form className={styles.login__form} onSubmit={onSubmit}>
                <input
                  type="text"
                  name="identifier"
                  placeholder="Email hoặc Username *"
                  value={form.identifier}
                  onChange={onChange}
                  autoComplete="username"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu *"
                  value={form.password}
                  onChange={onChange}
                  autoComplete="current-password"
                  required
                />
                <div className={styles.login__forgotPassword}>
                  <Link to="/forgot-password" className={styles.login__forgotLink}>
                    Quên mật khẩu?
                  </Link>
                </div>
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
                onClick={onLoginWithFacebook}
              >
                <FacebookIcon className={styles.login__icon} />
                <span>Đăng nhập với Facebook</span>
              </button>
              <button
                type="button"
                className={`${styles.login__btnSocial} ${styles.google}`}
                onClick={onLoginWithGoogle}
              >
                <GoogleIcon className={styles.login__icon} />
                <span>Đăng nhập với Google</span>
              </button>

              <div className={styles.login__footnote}>
                Chưa có tài khoản?{' '}
                <Link to="/register" className={styles.login__link}>
                  Đăng ký ngay
                </Link>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
