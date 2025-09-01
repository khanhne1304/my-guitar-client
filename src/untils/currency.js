export const fmtVND = (v) =>
new Intl.NumberFormat('vi-VN', {
style: 'currency',
currency: 'VND',
maximumFractionDigits: 0,
}).format(v || 0);