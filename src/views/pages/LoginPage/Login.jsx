import { Link } from "react-router-dom";
import styles from "./Login.module.css";

function FacebookIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-2.9h2v-2.2c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.9h2.2l-.4 2.9h-1.8v7A10 10 0 0 0 22 12z"
      />
    </svg>
  );
}
function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3C33.9 31.6 29.5 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.6 5.8 29.6 4 24 4 16.1 4 9.3 8.3 6.3 14.7z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.8 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C34.6 5.8 29.6 4 24 4 16.1 4 9.3 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.4 0 10.4-2.1 14.1-5.5l-6.5-5.3C29.5 35 26.9 36 24 36c-5.5 0-9.9-3.5-11.4-8.3l-6.5 5.1C9.2 39.7 16 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.3 3.1-4.5 7-11.3 7-5.5 0-10.1-3.7-11.7-8.7l-6.6 5.1C7.4 39 15 44 24 44c10.6 0 19.6-8.6 19.6-20 0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}
function BackIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l4.58-4.59L11 5l-7 7 7 7 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

export default function Login() {
  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: xử lý đăng nhập
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.login}>
        <div className={styles.login__card}>
          <Link to="/" className={styles.login__back}>
            <BackIcon className={styles.login__backIcon} />
            <span>Về trang chủ</span>
          </Link>

          <h1 className={styles.login__title}>Đăng nhập</h1>

          <div className={styles.login__container}>
            {/* Form */}
            <form className={styles.login__form} onSubmit={onSubmit}>
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Mật khẩu" required />
              <button type="submit" className={styles.login__btn}>Đăng nhập</button>
            </form>

            {/* Separator —— ĐĂNG NHẬP BẰNG —— */}
            <div className={styles.login__separator}>
              <span>Đăng nhập bằng</span>
            </div>

            {/* Social buttons */}
            <button type="button" className={`${styles.login__btnSocial} ${styles.facebook}`}>
              <FacebookIcon className={styles.login__icon} />
              <span>Facebook</span>
            </button>
            <button type="button" className={`${styles.login__btnSocial} ${styles.google}`}>
              <GoogleIcon className={styles.login__icon} />
              <span>Google</span>
            </button>

            {/* 👇 Dòng dẫn sang trang đăng ký */}
            <div className={styles.login__footnote}>
              Chưa có tài khoản?{" "}
              <Link to="/register" className={styles.login__link}>Đăng ký ngay</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
