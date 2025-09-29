import styles from "./ChangePasswordModal.module.css";
import { useChangePasswordViewModel } from "../../../../viewmodels/ChangePasswordViewModel";
export default function ChangePasswordModal({ isOpen, onClose }) {
  const { form, loading, error, success, handleChange, handleSubmit } =
    useChangePasswordViewModel(onClose);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Đổi mật khẩu</h2>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

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
              {loading ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
