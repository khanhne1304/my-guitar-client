// src/views/components/Modal/SuccessModal.jsx
import styles from "./SuccessModal.module.css";

export default function SuccessModal({ open, onClose, onContinue }) {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon}>✅</div>
        <h2 className={styles.title}>Thanh toán thành công!</h2>
        <p className={styles.text}>
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
        </p>
        <div className={styles.actions}>
          <button className={styles.okBtn} onClick={onClose}>
            OK
          </button>
          <button className={styles.continueBtn} onClick={onContinue}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
}
