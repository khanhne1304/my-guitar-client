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

// Gửi OTP cho đăng ký
export async function sendOTPForRegister(email) {
  return apiClient.post('/auth/send-otp-register', { email });
}

// Xác thực OTP và đăng ký
export async function verifyOTPAndRegister({
  username,
  email,
  fullName,
  address,
  phone,
  password,
  otp,
}) {
  return apiClient.post('/auth/verify-otp-register', {
    username,
    email,
    fullName,
    address,
    phone,
    password,
    otp,
  });
}

// Gửi OTP cho quên mật khẩu
export async function sendOTPForResetPassword(email) {
  return apiClient.post('/auth/send-otp', { email });
}

// Xác thực OTP
export async function verifyOTP(email, otp) {
  return apiClient.post('/auth/verify-otp', { email, otp });
}

// Đặt lại mật khẩu với OTP
export async function resetPasswordWithOTP(email, otp, newPassword) {
  return apiClient.post('/auth/reset-password', {
    email,
    otp,
    newPassword,
  });
}