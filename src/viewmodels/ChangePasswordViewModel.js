// src/viewmodels/ChangePasswordViewModel.js
import { useState } from "react";
import { getUser } from "../utils/storage";
import { sendOTP, verifyOTP, resetPasswordWithToken } from "../services/otpService";

export function useChangePasswordViewModel(onSuccess) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const currentUser = getUser();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (!currentUser?.email) {
        throw new Error("Không tìm thấy email tài khoản");
      }
      await sendOTP(currentUser.email);
      setShowOTPModal(true);
      setSuccess("Mã OTP đã được gửi tới email của bạn");
    } catch (err) {
      setError(err.message || "Không thể gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    try {
      setLoading(true);
      setError("");
      if (!currentUser?.email) {
        throw new Error("Không tìm thấy email tài khoản");
      }
      const verifyData = await verifyOTP(currentUser.email, otpCode.trim());
      const token = verifyData?.resetToken;
      if (!token) {
        throw new Error("OTP không hợp lệ hoặc đã hết hạn");
      }
      await resetPasswordWithToken(token, form.newPassword);
      setSuccess("Đổi mật khẩu thành công!");
      setShowOTPModal(false);
      setTimeout(() => {
        setSuccess("");
        onSuccess?.();
      }, 1000);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!currentUser?.email) {
      throw new Error("Không tìm thấy email tài khoản");
    }
    await sendOTP(currentUser.email);
  };

  return { form, loading, error, success, showOTPModal, setShowOTPModal, handleChange, handleSubmit, handleVerifyOTP, handleResendOTP, email: currentUser?.email || "" };
}
