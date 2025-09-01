// src/utils/validators.js
export function validateRegister(form, agree) {
  if (!agree) return 'Bạn cần đồng ý Điều khoản & Điều kiện.';
  if (!form.email || !form.password || !form.fullName) {
    return 'Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu.';
  }
  if (form.password.length < 6) {
    return 'Mật khẩu tối thiểu 6 ký tự.';
  }
  if (form.password !== form.confirm) {
    return 'Mật khẩu nhập lại không khớp.';
  }
  // Có thể bổ sung validate email, phone, password mạnh hơn tại đây
  return '';
}
