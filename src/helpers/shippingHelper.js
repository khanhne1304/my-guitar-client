// src/helpers/shippingHelper.js
import { haversineDistance } from './geoHelper';

// Toạ độ cửa hàng: Số 1 Võ Văn Ngân, TP Thủ Đức, TP.HCM
const STORE_LOCATION = { lat: 10.850128, lng: 106.771458 };

// Tọa độ mẫu cho một số quận để test offline
const DISTRICT_COORDS = {
  'Quận 1': { lat: 10.7769, lng: 106.7009 },
  'Quận 3': { lat: 10.7847, lng: 106.6901 },
  'Bình Thạnh': { lat: 10.8142, lng: 106.7078 },
  'Thủ Đức': { lat: 10.8496, lng: 106.7714 },
  'Quận 7': { lat: 10.7340, lng: 106.7218 },
};

/**
 * Giả lập geocoding địa chỉ để trả về toạ độ
 */
export async function geocodeAddressMock(address = '') {
  const districtKey = Object.keys(DISTRICT_COORDS).find((d) =>
    address.toLowerCase().includes(d.toLowerCase())
  );
  return districtKey ? DISTRICT_COORDS[districtKey] : DISTRICT_COORDS['Quận 1'];
}

/**
 * Tính khoảng cách từ cửa hàng đến địa chỉ
 */
export async function calculateDistanceToStore(address) {
  const geo = await geocodeAddressMock(address);
  return haversineDistance(
    STORE_LOCATION.lat,
    STORE_LOCATION.lng,
    geo.lat,
    geo.lng
  );
}

/**
 * Tính phương thức giao hàng dựa vào khoảng cách & tổng đơn
 */
export function calculateShippingMethods(distanceKm = 0, subtotal = 0) {
  let economyFee, standardFee, expressFee;

  if (distanceKm <= 5) {
    economyFee = 15000;
    standardFee = 25000;
    expressFee = 50000;
  } else if (distanceKm <= 15) {
    economyFee = 25000;
    standardFee = 35000;
    expressFee = 70000;
  } else {
    const extra = Math.ceil(distanceKm - 15);
    economyFee = 35000 + extra * 2000;
    standardFee = 45000 + extra * 2500;
    expressFee = 80000 + extra * 3000;
  }

  if (subtotal >= 500_000) {
    economyFee = Math.max(0, economyFee - 15000);
  }

  return [
    { id: 'economy', name: 'Tiết kiệm', eta: '2–4 ngày', fee: economyFee },
    { id: 'standard', name: 'Nhanh', eta: '24–48 giờ', fee: standardFee },
    { id: 'express', name: 'Hỏa tốc', eta: '2–4 giờ (nội thành)', fee: expressFee },
  ];
}
