// CheckoutViewModel.js
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useDeliveryState } from '../hooks/useDeliveryState';
import { useStoresEligibility } from '../hooks/useStoresEligibility';
import { STORES } from '../../src/views/components/Data/stores';
import { getUser } from '../utils/storage';
import { CheckoutForm, CheckoutOrder } from '../models/checkoutModel';
import { checkoutOrderApi } from '../services/orderService';

const SHIP_METHODS = [
  { id: 'economy', name: 'Tiết kiệm', eta: '2–4 ngày', fee: 15000 },
  { id: 'standard', name: 'Nhanh', eta: '24–48 giờ', fee: 30000 },
  { id: 'express', name: 'Hỏa tốc', eta: '2–4 giờ (nội thành)', fee: 80000 },
];

export function useCheckoutViewModel() {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();

  const { mode, setMode, shipMethod, setShipMethod, delivery } = useDeliveryState();
  const [form, setForm] = useState(new CheckoutForm());
  const [showSuccess, setShowSuccess] = useState(false);

  // Load dữ liệu user từ localStorage
  useEffect(() => {
    const u = getUser?.();
    if (!u) return;
    const fullName = u.fullName || u.name || '';
    const email = u.email || '';
    const phone = u.phone || u.phoneNumber || '';
    const addrObj =
      typeof u.address === 'object' && u.address !== null
        ? u.address
        : { address: u.address || '' };

    setForm((prev) => ({
      ...prev,
      name: prev.name || fullName,
      email: prev.email || email,
      phone: prev.phone || phone,
      address: prev.address || addrObj.address || addrObj.street || '',
      city: prev.city || addrObj.city || addrObj.province || '',
      district: prev.district || addrObj.district || addrObj.ward || '',
      country: prev.country || addrObj.country || 'Vietnam',
    }));
  }, []);

  const { eligibleStores } = useStoresEligibility(cartItems, STORES);
  const [storeId, setStoreId] = useState('');
  const pickedStore = useMemo(
    () => eligibleStores.find((s) => s.id === storeId),
    [eligibleStores, storeId],
  );

  const shipFee = useMemo(
    () => (mode === 'pickup' ? 0 : SHIP_METHODS.find((m) => m.id === shipMethod)?.fee || 0),
    [mode, shipMethod],
  );
  const total = useMemo(() => subtotal + shipFee, [subtotal, shipFee]);

  const [orderId] = useState(() => `MM${Date.now()}`);
  const order = new CheckoutOrder({ orderId, subtotal, shipFee, total });

  const payIsOnline = ['onpay-atm', 'onpay-visa'].includes(form.method);
  const [showQR, setShowQR] = useState(false);
  const [paid, setPaid] = useState(false);

  const orderInfo = `Thanh toan don ${order.orderId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    `VNPAY|ORDER=${order.orderId}|AMOUNT=${order.total}|INFO=${orderInfo}`,
  )}`;

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống.');
      navigate('/cart');
      return;
    }
    if (mode === 'delivery') {
      if (!form.name || !form.phone || !form.address || !form.city || !form.district) {
        alert('Vui lòng nhập đầy đủ thông tin giao hàng!');
        return;
      }
    } else if (!storeId) {
      alert('Vui lòng chọn cửa hàng để nhận!');
      return;
    }

    if (payIsOnline) {
      if (!showQR) {
        setShowQR(true);
        return;
      }
      if (!paid) {
        alert("Vui lòng quét QR VNPay và bấm 'Tôi đã thanh toán'.");
        return;
      }
    }

    // Build payload for API
    const payload = {
      cart: cartItems.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty,
      })),
      buyer: {
        name: form.name,
        fullName: form.name,
        phone: form.phone,
      },
      shipping: {
        mode,
        address:
          mode === 'delivery'
            ? {
                fullName: form.name,
                phone: form.phone,
                address: form.address,
                city: form.city,
                district: form.district,
              }
            : undefined,
        pickupStore: mode === 'pickup' ? pickedStore || null : undefined,
      },
      payment: {
        method: form.method,
      },
      pricing: {
        total,
      },
    };

    try {
      const orderRes = await checkoutOrderApi(payload);
      // Có thể dùng orderRes nếu cần hiển thị mã đơn
      clearCart();
      setShowSuccess(true);
    } catch (e) {
      alert(e?.message || 'Không thể tạo đơn hàng.');
    }
  };

  return {
    cartItems,
    form,
    setForm,
    mode,
    setMode,
    shipMethod,
    setShipMethod,
    delivery,
    eligibleStores,
    storeId,
    setStoreId,
    pickedStore,
    shipFee,
    total,
    order,
    payIsOnline,
    showQR,
    setShowQR,
    paid,
    setPaid,
    orderInfo,
    qrUrl,
    showSuccess,
    setShowSuccess,
    placeOrder,
    navigate,
    SHIP_METHODS,
  };
}
