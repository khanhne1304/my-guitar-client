import { apiClient } from './apiClient';

// Kiểm tra email có tồn tại trong hệ thống không
export async function checkEmailExists(email) {
  try {
    const data = await apiClient.post('/auth/check-email', { email });
    return data;
  } catch (error) {
    throw new Error(error.data?.message || 'Email không tồn tại trong hệ thống');
  }
}

// Gửi OTP đến email
export async function sendOTP(email) {
  try {
    // Kiểm tra email có tồn tại trước
    await checkEmailExists(email);
    
    const data = await apiClient.post('/auth/send-otp', { email });
    return data;
  } catch (error) {
    // Nếu lỗi từ checkEmailExists, giữ nguyên message
    if (error.message.includes('không tồn tại')) {
      throw error;
    }
    // Nếu lỗi từ việc gửi OTP
    throw new Error(error.data?.message || 'Không thể gửi OTP');
  }
}

// Xác thực OTP
export async function verifyOTP(email, otp) {
  try {
    const data = await apiClient.post('/auth/verify-otp', { email, otp });
    // API returns { message, data: { verified, email, resetToken } }
    return data?.data || data;
  } catch (error) {
    throw new Error(error.data?.message || 'OTP không hợp lệ');
  }
}

// Gửi OTP cho đăng ký
export async function sendOTPForRegister(email) {
  try {
    const data = await apiClient.post('/auth/send-otp-register', { email });
    return data;
  } catch (error) {
    throw new Error(error.data?.message || 'Không thể gửi OTP');
  }
}

// Xác thực OTP và hoàn thành đăng ký
export async function verifyOTPAndRegister(userData, otp) {
  try {
    const data = await apiClient.post('/auth/verify-otp-register', {
      ...userData,
      otp
    });
    console.log('otpService - Response data:', data);
    return data;
  } catch (error) {
    console.log('otpService - Error:', error);
    throw new Error(error.data?.message || 'Xác thực OTP thất bại');
  }
}

// Đặt lại mật khẩu với token
export async function resetPasswordWithToken(token, newPassword) {
  try {
    const data = await apiClient.post('/auth/reset-password-token', {
      token,
      newPassword
    });
    return data;
  } catch (error) {
    throw new Error(error.data?.message || 'Không thể đặt lại mật khẩu');
  }
}
