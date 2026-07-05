import styles from './AdminRoleChoice.module.css';

export default function AdminRoleChoice({ onContinueAsCustomer, onContinueAsAdmin }) {
  return (
    <div className={styles.roleChoice}>
      <p className={styles.roleChoice__message}>
        Bạn đang đăng nhập với tài khoản quản trị viên. Vui lòng chọn cách tiếp tục:
      </p>
      <div className={styles.roleChoice__actions}>
        <button
          type="button"
          className={`${styles.roleChoice__btn} ${styles.roleChoice__btnCustomer}`}
          onClick={onContinueAsCustomer}
        >
          Tiếp tục với tư cách khách hàng
        </button>
        <button
          type="button"
          className={`${styles.roleChoice__btn} ${styles.roleChoice__btnAdmin}`}
          onClick={onContinueAsAdmin}
        >
          Tiếp tục với tư cách quản trị viên
        </button>
      </div>
    </div>
  );
}
