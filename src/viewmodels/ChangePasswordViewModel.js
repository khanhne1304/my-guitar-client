// src/viewmodels/ChangePasswordViewModel.js
import { useState } from "react";
import { changePasswordApi } from "../services/userService";

export function useChangePasswordViewModel(onSuccess) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      await changePasswordApi({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess("Đổi mật khẩu thành công!");
      setTimeout(() => {
        setSuccess("");
        onSuccess?.();
      }, 1000);
    } catch (err) {
      setError(err.message || "Không thể đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, error, success, handleChange, handleSubmit };
}
