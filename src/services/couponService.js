// src/services/couponService.js
import { apiClient } from './apiClient';
export async function applyCouponApi({ code, items, subtotal, shipFee }) {
  return apiClient.post('/coupons/apply', { code, items, subtotal, shipFee });
}
