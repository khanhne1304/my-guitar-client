// src/views/components/AddressBook/AddressCard.jsx
import styles from './AddressCard.module.css';

export default function AddressCard({
  address,
  label,
  fullAddress,
  isSelected,
  isDefault,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault
}) {
  return (
    <div className={`${styles.addressCard} ${isSelected ? styles.selected : ''}`}>
      <div className={styles.content}>
        {isDefault && (
          <span className={styles.defaultBadge}>Mặc định</span>
        )}
        
        <div className={styles.header}>
          <h4>{address.fullName}</h4>
          <span className={styles.label}>{label}</span>
        </div>
        
        <div className={styles.contact}>
          <span className={styles.phone}>{address.phone}</span>
        </div>
        
        <div className={styles.address}>
          {fullAddress}
        </div>

        {isSelected && (
          <div className={styles.selectedIndicator}>
            ✓ Đã chọn
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {onSelect && !isSelected && (
          <button 
            className={styles.selectButton}
            onClick={onSelect}
          >
            Chọn
          </button>
        )}
        
        {!isDefault && (
          <button 
            className={styles.defaultButton}
            onClick={onSetDefault}
          >
            Đặt mặc định
          </button>
        )}
        
        <button 
          className={styles.editButton}
          onClick={onEdit}
        >
          Sửa
        </button>
        
        <button 
          className={styles.deleteButton}
          onClick={onDelete}
        >
          Xóa
        </button>
      </div>
    </div>
  );
}
