// src/services/addressService.js
import { apiClient } from './apiClient';
import { getToken } from '../utils/storage';

const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    throw new Error('API token not found');
  }
  return { Authorization: `Bearer ${token}` };
};

export const getUserAddresses = async () => {
  return apiClient.get('/addresses', { headers: getAuthHeaders() });
};

export const getDefaultAddress = async () => {
  return apiClient.get('/addresses/default', { headers: getAuthHeaders() });
};

export const getAddressById = async (addressId) => {
  return apiClient.get(`/addresses/${addressId}`, { headers: getAuthHeaders() });
};

export const createAddress = async (addressData) => {
  return apiClient.post('/addresses', addressData, { headers: getAuthHeaders() });
};

export const updateAddress = async (addressId, addressData) => {
  return apiClient.put(`/addresses/${addressId}`, addressData, { headers: getAuthHeaders() });
};

export const deleteAddress = async (addressId) => {
  return apiClient.delete(`/addresses/${addressId}`, { headers: getAuthHeaders() });
};

export const setDefaultAddress = async (addressId) => {
  return apiClient.post(`/addresses/${addressId}/default`, null, { headers: getAuthHeaders() });
};

export default {
  getUserAddresses,
  getDefaultAddress,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
