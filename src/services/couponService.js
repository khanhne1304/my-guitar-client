// src/services/couponService.js
import { apiClient } from './apiClient';

// Server expects: { code, orderTotal }
export async function applyCouponApi({ code, orderTotal }) {
  return apiClient.post('/coupons/apply', { code, orderTotal });
}
