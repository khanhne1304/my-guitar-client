// src/services/authService.js
import { apiClient } from './apiClient';

// Đăng ký vẫn gửi đủ trường
export async function register({
  username,
  name,
  email,
  address,
  phone,
  password,
}) {
  return apiClient.post('/auth/register', {
    username,
    name,
    email,
    address,
    phone,
    password,
  });
}

// Đăng nhập với identifier (có thể là email hoặc username)
export async function login({ identifier, password }) {
  return apiClient.post('/auth/login', { identifier, password });
}
