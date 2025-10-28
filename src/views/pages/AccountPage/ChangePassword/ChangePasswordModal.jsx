import styles from "./ChangePasswordModal.module.css";
import { useChangePasswordViewModel } from "../../../../viewmodels/ChangePasswordViewModel";
import OTPModal from "../../../../components/OTPModal/OTPModal";
export default function ChangePasswordModal({ isOpen, onClose }) {
  const { form, loading, error, success, showOTPModal, setShowOTPModal, handleChange, handleSubmit, handleVerifyOTP, handleResendOTP, email } =
    useChangePasswordViewModel(onClose);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Đổi mật khẩu</h2>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        {(
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>Mật khẩu hiện tại</label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className={styles.field}>
              <label>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.actions}>
              <button type="button" onClick={onClose} className={styles.cancelBtn}>
                Hủy
              </button>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Đang gửi..." : "Cập nhật"}
              </button>
            </div>
          </form>
        )}
      </div>
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={email}
        onVerifyOTP={handleVerifyOTP}
        onResendOTP={handleResendOTP}
      />
    </div>
  );
}
