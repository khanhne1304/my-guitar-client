// src/utils/addressDebugger.js
// Utility để debug các vấn đề về địa chỉ

import { getToken, getUser } from './storage';
import * as addressService from '../services/addressService';

export const debugAddressLoading = async () => {
  console.log('🔍 === ADDRESS DEBUGGING ===');
  
  // 1. Check token
  const token = getToken();
  console.log('1. Token status:', token ? '✅ Present' : '❌ Missing');
  if (token) {
    console.log('   Token preview:', token.substring(0, 20) + '...');
  }
  
  // 2. Check user
  const user = getUser();
  console.log('2. User status:', user ? '✅ Present' : '❌ Missing');
  if (user) {
    console.log('   User ID:', user._id || user.id);
    console.log('   User name:', user.name || user.fullName);
  }
  
  // 3. Test API calls
  if (token) {
    try {
      console.log('3. Testing getUserAddresses API...');
      const addressesData = await addressService.getUserAddresses();
      console.log('   ✅ getUserAddresses success:', {
        count: addressesData.addresses?.length || 0,
        addresses: addressesData.addresses
      });
    } catch (error) {
      console.log('   ❌ getUserAddresses failed:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
    }
    
    try {
      console.log('4. Testing getDefaultAddress API...');
      const defaultData = await addressService.getDefaultAddress();
      console.log('   ✅ getDefaultAddress success:', {
        hasDefault: !!defaultData.address,
        defaultAddress: defaultData.address
      });
    } catch (error) {
      console.log('   ❌ getDefaultAddress failed:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
    }
  } else {
    console.log('3. Skipping API tests - no token');
  }
  
  console.log('🔍 === END DEBUG ===');
};

// Function để test trong browser console
window.debugAddressLoading = debugAddressLoading;
