import { apiClient } from './apiClient';

// Kiểm tra email có tồn tại trong hệ thống không
export async function checkEmailExists(email) {
  try {
    const response = await apiClient.post('/auth/check-email', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Email không tồn tại trong hệ thống');
  }
}

// Gửi OTP đến email
export async function sendOTP(email) {
  try {
    // Kiểm tra email có tồn tại trước
    await checkEmailExists(email);
    
    const response = await apiClient.post('/auth/send-otp', { email });
    return response.data;
  } catch (error) {
    // Nếu lỗi từ checkEmailExists, giữ nguyên message
    if (error.message.includes('không tồn tại')) {
      throw error;
    }
    // Nếu lỗi từ việc gửi OTP
    throw new Error(error.response?.data?.message || 'Không thể gửi OTP');
  }
}

// Xác thực OTP
export async function verifyOTP(email, otp) {
  try {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'OTP không hợp lệ');
  }
}

// Gửi OTP cho đăng ký
export async function sendOTPForRegister(email) {
  try {
    const response = await apiClient.post('/auth/send-otp-register', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể gửi OTP');
  }
}

// Xác thực OTP và hoàn thành đăng ký
export async function verifyOTPAndRegister(userData, otp) {
  try {
    const response = await apiClient.post('/auth/verify-otp-register', {
      ...userData,
      otp
    });
    console.log('otpService - Response:', response);
    console.log('otpService - Response.data:', response.data);
    return response.data;
  } catch (error) {
    console.log('otpService - Error:', error);
    console.log('otpService - Error.response:', error.response);
    throw new Error(error.response?.data?.message || 'Xác thực OTP thất bại');
  }
}

// Đặt lại mật khẩu với token
export async function resetPasswordWithToken(token, newPassword) {
  try {
    const response = await apiClient.post('/auth/reset-password-token', {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể đặt lại mật khẩu');
  }
}
