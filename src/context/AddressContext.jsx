// src/context/AddressContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getToken } from '../utils/storage';
import * as addressService from '../services/addressService';

const AddressContext = createContext(null);

export function AddressProvider({ children }) {
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user addresses
  const loadAddresses = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setAddresses([]);
      setDefaultAddress(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const [addressesData, defaultData] = await Promise.all([
        addressService.getUserAddresses(),
        addressService.getDefaultAddress()
      ]);
      
      setAddresses(addressesData.addresses || []);
      setDefaultAddress(defaultData.address);
    } catch (err) {
      setError(err.message || 'Có lỗi khi tải danh sách địa chỉ');
      console.error('Load addresses error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new address
  const createAddress = useCallback(async (addressData) => {
    const token = getToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để thêm địa chỉ');
    }

    setLoading(true);
    setError(null);
    
    try {
      const newAddress = await addressService.createAddress(addressData);
      setAddresses(prev => {
        const updated = [newAddress, ...prev];
        // Sort by isDefault first, then by createdAt
        return updated.sort((a, b) => {
          if (a.isDefault !== b.isDefault) return b.isDefault - a.isDefault;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      });
      
      // If this is the first address or is set as default
      if (addressData.isDefault || addresses.length === 0) {
        setDefaultAddress(newAddress);
      }
      
      return newAddress;
    } catch (err) {
      setError(err.message || 'Có lỗi khi tạo địa chỉ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addresses.length]);

  // Update address
  const updateAddress = useCallback(async (addressId, addressData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedAddress = await addressService.updateAddress(addressId, addressData);
      
      setAddresses(prev => 
        prev.map(addr => 
          addr._id === addressId ? updatedAddress : addr
        ).sort((a, b) => {
          if (a.isDefault !== b.isDefault) return b.isDefault - a.isDefault;
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
      );

      // Update default address if this was set as default
      if (addressData.isDefault || updatedAddress.isDefault) {
        setDefaultAddress(updatedAddress);
      }
      
      return updatedAddress;
    } catch (err) {
      setError(err.message || 'Có lỗi khi cập nhật địa chỉ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete address
  const deleteAddress = useCallback(async (addressId) => {
    setLoading(true);
    setError(null);
    
    try {
      await addressService.deleteAddress(addressId);
      
      // Filter out deleted address
      const addressToDelete = addresses.find(addr => addr._id === addressId);
      setAddresses(prev => prev.filter(addr => addr._id !== addressId));
      
      // If deleted was default, update default address
      if (addressToDelete?.isDefault) {
        const newDefault = addresses.find(addr => addr._id !== addressId && addr.isDefault);
        setDefaultAddress(newDefault || null);
      }
      
    } catch (err) {
      setError(err.message || 'Có lỗi khi xóa địa chỉ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addresses]);

  // Set default address
  const setDefaultAddressById = useCallback(async (addressId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await addressService.setDefaultAddress(addressId);
      
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          isDefault: addr._id === addressId
        })).sort((a, b) => {
          if (a.isDefault !== b.isDefault) return b.isDefault - a.isDefault;
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
      );
      
      setDefaultAddress(result.address);
      
    } catch (err) {
      setError(err.message || 'Có lỗi khi đặt địa chỉ mặc định');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load addresses when token changes
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const value = {
    addresses,
    defaultAddress,
    loading,
    error,
    loadAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddressById
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within AddressProvider');
  }
  return context;
}
