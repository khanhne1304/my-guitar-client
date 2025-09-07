// RegisterView.jsx
import { Link } from 'react-router-dom';
import styles from './RegisterPage.module.css';
import BackIcon from '../../components/icons/BackIcon';
import FacebookIcon from '../../components/icons/FacebookIcon';
import GoogleIcon from '../../components/icons/GoogleIcon';
import { useRegisterViewModel } from '../../../viewmodels/AuthViewModel/RegisterViewModel';

export default function RegisterPage() {
  const {
    form,
    agree,
    loading,
    err,
    ok,
    onChange,
    setAgree,
    handleSubmit,
  } = useRegisterViewModel();

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
            <form
              className={styles.register__form}
              onSubmit={handleSubmit}
              noValidate
            >
              <input type="text" name="username" placeholder="Tên tài khoản"
                value={form.username} onChange={onChange} required />
              <input type="email" name="email" placeholder="Email"
                value={form.email} onChange={onChange} required />
              <input type="text" name="fullName" placeholder="Họ và tên"
                value={form.fullName} onChange={onChange} required />
              <input type="text" name="address" placeholder="Địa chỉ"
                value={form.address} onChange={onChange} required />
              <input type="tel" name="phone" placeholder="Số điện thoại"
                value={form.phone} onChange={onChange} required />
              <input type="password" name="password" placeholder="Mật khẩu"
                value={form.password} onChange={onChange} required />
              <input type="password" name="confirm" placeholder="Nhập lại mật khẩu"
                value={form.confirm} onChange={onChange} required />

              <div className={styles.register__terms}>
                <input id="agree" type="checkbox"
                  checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <label htmlFor="agree">
                  Đồng ý với <strong>Điều khoản</strong> và <strong>Điều kiện</strong>
                </label>
              </div>

              <button type="submit"
                className={`${styles.register__btn} ${
                  !agree || loading ? styles['register__btn--disabled'] : ''
                }`}
                disabled={!agree || loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </form>

            <div className={styles.register__divider} />

            <div className={styles.register__social}>
              <p className={styles.register__socialTitle}>Đăng ký bằng</p>
              <button type="button" className={`${styles.register__btnSocial} ${styles.facebook}`} disabled>
                <FacebookIcon className={styles.register__icon} />
                <span>Facebook (sắp có)</span>
              </button>
              <button type="button" className={`${styles.register__btnSocial} ${styles.google}`} disabled>
                <GoogleIcon className={styles.register__icon} />
                <span>Google (sắp có)</span>
              </button>
            </div>
          </div>

          <div className={styles.register__footnote}>
            Đã có tài khoản?{' '}
            <Link to="/login" className={styles.register__link}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
