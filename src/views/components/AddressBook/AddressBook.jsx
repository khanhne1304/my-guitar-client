// src/views/components/AddressBook/AddressBook.jsx
import { useState } from 'react';
import styles from './AddressBook.module.css';
import { useAddress } from '../../../context/AddressContext';
import AddressCard from './AddressCard';
import AddressFormModal from './AddressFormModal';
import ConfirmModal from './ConfirmModal';

export default function AddressBook({ onSelectAddress, selectedAddressId }) {
  const {
    addresses,
    defaultAddress,
    loading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddressById
  } = useAddress();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowFormModal(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowFormModal(true);
  };

  const handleDelete = (addressId) => {
    setShowDeleteModal(addressId);
  };

  const confirmDelete = async () => {
    try {
      await deleteAddress(showDeleteModal);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Delete address error:', error);
    }
  };

  const handleSave = async (addressData) => {
    try {
      if (editingAddress) {
        await updateAddress(editingAddress._id, addressData);
      } else {
        await createAddress(addressData);
      }
      setShowFormModal(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Save address error:', error);
      throw error; // Re-throw to let modal handle it
    }
  };

  const getAddressLabel = (label, customLabel) => {
    switch (label) {
      case 'home': return 'Nhà';
      case 'office': return 'Văn phòng';
      case 'other': return customLabel || 'Khác';
      default: return 'Nhà';
    }
  };

  const getDisplayAddress = (address) => {
    const parts = [
      address.address,
      address.ward || '',
      address.district,
      address.city
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (loading && addresses.length === 0) {
    return (
      <div className={styles.addressBook}>
        <div className={styles.loading}>Đang tải danh sách địa chỉ...</div>
      </div>
    );
  }

  return (
    <div className={styles.addressBook}>
      <div className={styles.header}>
        <h3>Sổ địa chỉ</h3>
        <button 
          className={styles.addButton}
          onClick={handleAddNew}
        >
          + Thêm địa chỉ
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.addressList}>
        {addresses.length === 0 ? (
          <div className={styles.empty}>
            <p>Bạn chưa có địa chỉ nào</p>
            <button onClick={handleAddNew}>
              Thêm địa chỉ đầu tiên
            </button>
          </div>
        ) : (
          addresses.map(address => (
            <AddressCard
              key={address._id}
              address={address}
              label={getAddressLabel(address.label, address.customLabel)}
              fullAddress={getDisplayAddress(address)}
              isSelected={selectedAddressId === address._id}
              isDefault={address.isDefault}
              onSelect={() => onSelectAddress?.(address)}
              onEdit={() => handleEdit(address)}
              onDelete={() => handleDelete(address._id)}
              onSetDefault={() => setDefaultAddressById(address._id)}
            />
          ))
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <AddressFormModal
          address={editingAddress}
          onSubmit={handleSave}
          onClose={() => {
            setShowFormModal(false);
            setEditingAddress(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Xóa địa chỉ"
          message="Bạn có chắc chắn muốn xóa địa chỉ này?"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(null)}
          loading={loading}
        />
      )}
    </div>
  );
}
