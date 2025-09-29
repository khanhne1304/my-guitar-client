// src/views/components/checkout/AddressSelector.jsx
import { useState, useEffect } from 'react';
import styles from './AddressSelector.module.css';
import { useAddress } from '../../../context/AddressContext';
import AddressBook from '../AddressBook/AddressBook';

export default function AddressSelector({ selectedAddress, onAddressSelect, form, setForm }) {
  const { addresses, defaultAddress, loading } = useAddress();
  const [showAddressBook, setShowAddressBook] = useState(false);

  const handleSelectFromBook = (address) => {
    // Map selected address to form fields
    setForm({
      ...form,
      name: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district,
      ward: address.ward,
    });
    
    onAddressSelect?.(address);
    setShowAddressBook(false);
  };

  // Auto-select default address on first render if none selected
  useEffect(() => {
    if (!selectedAddress && defaultAddress) {
      setForm({
        ...form,
        name: defaultAddress.fullName,
        phone: defaultAddress.phone,
        address: defaultAddress.address,
        city: defaultAddress.city,
        district: defaultAddress.district,
        ward: defaultAddress.ward,
      });
      onAddressSelect?.(defaultAddress);
    }
  }, [defaultAddress]);

  if (showAddressBook) {
    return (
      <div className={styles.addressSelector}>
        <div className={styles.header}>
          <h3>Chọn địa chỉ giao hàng</h3>
        </div>
        
        <AddressBook 
          onSelectAddress={handleSelectFromBook}
          selectedAddressId={selectedAddress?._id}
        />
      </div>
    );
  }

  return (
    <div className={styles.addressSelector}>
      <div className={styles.header}>
        <h3>Địa chỉ giao hàng</h3>
        <button 
          onClick={() => setShowAddressBook(true)}
          className={styles.selectFromBookButton}
        >
          {addresses.length > 0 ? 'Chọn từ sổ địa chỉ' : 'Chọn địa chỉ'}
        </button>
      </div>

      {!selectedAddress && (
        <div className={styles.selectedAddressInfo}>
          <div className={styles.addressSummary}>
            Chưa có địa chỉ được chọn. Vui lòng chọn từ sổ địa chỉ.
          </div>
        </div>
      )}

      {selectedAddress && (
        <div className={styles.selectedAddressInfo}>
          <h4>Địa chỉ đã chọn:</h4>
          <div className={styles.addressSummary}>
            <strong>{selectedAddress.fullName}</strong> - {selectedAddress.phone}
            <br />
            {selectedAddress.address}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.city}
          </div>
        </div>
      )}
    </div>
  );
}
