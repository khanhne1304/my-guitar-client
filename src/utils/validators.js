// Trả về "" nếu hợp lệ; ngược lại trả về message lỗi
export function validateRegister(form, agree) {
  const username = (form.username || '').trim();
  const email = (form.email || '').trim();
  const fullName = (form.fullName || '').trim();
  const address = (form.address || '').trim();
  const phone = (form.phone || '').trim();
  const password = form.password || '';
  const confirm = form.confirm || '';

  // username
  if (!username) return 'Vui lòng nhập tên tài khoản.';
  if (username.length < 3 || username.length > 30)
    return 'Tên tài khoản phải từ 3–30 ký tự.';
  if (!/^[a-zA-Z0-9._-]+$/.test(username))
    return 'Tên tài khoản chỉ chứa chữ, số, dấu chấm (.), gạch dưới (_), gạch nối (-).';

  // fullName
  if (!fullName) return 'Vui lòng nhập họ và tên.';

  // email
  if (!email) return 'Vui lòng nhập email.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email không hợp lệ.';

  // address
  if (!address) return 'Vui lòng nhập địa chỉ.';
  if (address.length > 200) return 'Địa chỉ quá dài (tối đa 200 ký tự).';

  // phone (kiểm tra dạng phổ biến VN: 0xxxxxxxxx / +84xxxxxxxxx)
  if (!phone) return 'Vui lòng nhập số điện thoại.';
  const phoneNorm = normalizeVNPhone(phone);
  if (!/^(0|\+84)\d{9,10}$/.test(phoneNorm))
    return 'Số điện thoại không hợp lệ.';

  // password
  if (!password) return 'Vui lòng nhập mật khẩu.';
  if (password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự.';

  // confirm
  if (password !== confirm) return 'Mật khẩu nhập lại không khớp.';

  // agree
  if (!agree) return 'Bạn cần đồng ý với Điều khoản & Điều kiện.';

  return '';
}

export function normalizeVNPhone(raw) {
  let s = (raw || '').replace(/\s+/g, '');
  // đổi +84 thành 0 nếu có
  if (s.startsWith('+84')) s = '0' + s.slice(3);
  return s;
}
