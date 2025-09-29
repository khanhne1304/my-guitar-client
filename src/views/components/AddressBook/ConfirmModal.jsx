// src/views/components/AddressBook/ConfirmModal.jsx
import styles from './ConfirmModal.module.css';

export default function ConfirmModal({ 
  title = 'Xác nhận', 
  message = 'Bạn có chắc chắn?', 
  onConfirm, 
  onCancel, 
  loading = false,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy'
}) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
        </div>
        
        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>
        
        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={styles.confirmButton}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
