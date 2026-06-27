// src/viewmodels/CheckoutViewModel.js
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useDeliveryState } from '../hooks/useDeliveryState';
import { useStoresEligibility } from '../hooks/useStoresEligibility';
import { listStores } from '../services/storeService';
import { getUser } from '../utils/storage';
import { CheckoutForm, CheckoutOrder } from '../models/checkoutModel';
import { checkoutOrderApi, createVnpayUrlApi } from '../services/orderService';
import { calculateDistanceToStore, calculateShippingMethods } from '../helpers/shippingHelper';
import { applyCouponApi } from '../services/couponService';

// Dynamic based on distance/subtotal; fallback initial values
const DEFAULT_SHIP_METHODS = [
  { id: 'economy', name: 'Tiết kiệm', eta: '2–4 ngày', fee: 15000 },
  { id: 'standard', name: 'Nhanh', eta: '24–48 giờ', fee: 30000 },
  { id: 'express', name: 'Hỏa tốc', eta: '2–4 giờ (nội thành)', fee: 80000 },
];

export function useCheckoutViewModel() {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();

  // ===== SHIPPING / FORM =====
  const { mode, setMode, shipMethod, setShipMethod, delivery } = useDeliveryState();
  const [form, setForm] = useState(new CheckoutForm());
  const [distanceKm, setDistanceKm] = useState(0);
  const [shipMethods, setShipMethods] = useState(DEFAULT_SHIP_METHODS);
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null); // { discount, finalTotal, coupon }
  const discount = useMemo(() => couponInfo?.discount || 0, [couponInfo]);

  // ===== STORE PICKUP =====
  const [stores, setStores] = useState([]);
  useEffect(() => {
    (async () => {
      const data = await listStores();
      setStores(data || []);
    })();
  }, []);
  const { eligibleStores } = useStoresEligibility(cartItems, stores);
  const [storeId, setStoreId] = useState('');
  const pickedStore = useMemo(
    () => eligibleStores.find((s) => (s._id || s.id) === storeId),
    [eligibleStores, storeId]
  );

  // ===== PRICING =====
  const shipFee = useMemo(
    () => (mode === 'pickup' ? 0 : shipMethods.find((m) => m.id === shipMethod)?.fee || 0),
    [mode, shipMethod, shipMethods]
  );
  const preDiscountTotal = useMemo(() => subtotal + shipFee, [subtotal, shipFee]);
  const total = useMemo(() => Math.max(0, preDiscountTotal - discount), [preDiscountTotal, discount]);

  // ===== ORDER INFO =====
  const [orderId] = useState(() => `MM${Date.now()}`);
  const order = new CheckoutOrder({ orderId, subtotal, shipFee, total });

  // ===== PAYMENT =====
  const [placingOrder, setPlacingOrder] = useState(false);

  // ===== SUCCESS MODAL STATE =====
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // ===== PREFILL USER INFO =====
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

  // ===== DISTANCE & SHIPPING METHODS (per-km) =====
  useEffect(() => {
    if (mode !== 'delivery') {
      setDistanceKm(0);
      setShipMethods(DEFAULT_SHIP_METHODS);
      return;
    }

    const addrStr = [form.address, form.district, form.city].filter(Boolean).join(', ');
    if (!addrStr) {
      setDistanceKm(0);
      setShipMethods(DEFAULT_SHIP_METHODS);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const km = await calculateDistanceToStore(addrStr);
        if (!mounted) return;
        setDistanceKm(km);
        const methods = calculateShippingMethods(km, subtotal);
        setShipMethods(methods);
        // Ensure selected method is valid
        const exists = methods.some((m) => m.id === shipMethod);
        if (!exists) setShipMethod(methods[0]?.id || 'standard');
      } catch {
        if (!mounted) return;
        setDistanceKm(0);
        setShipMethods(DEFAULT_SHIP_METHODS);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [mode, form.address, form.district, form.city, subtotal]);

  // ===== COUPON =====
  const applyCoupon = async () => {
    const code = (couponCode || '').trim();
    if (!code) {
      alert('Vui lòng nhập mã giảm giá');
      return;
    }
    try {
      const res = await applyCouponApi({ code, orderTotal: preDiscountTotal });
      setCouponInfo(res);
      alert('Áp dụng mã thành công');
    } catch (e) {
      alert(e?.message || 'Không áp dụng được mã');
      setCouponInfo(null);
    }
  };

  const removeCoupon = () => {
    setCouponInfo(null);
    setCouponCode('');
  };

  // ===== PLACE ORDER FUNCTION =====
  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống.');
      navigate('/cart');
      return;
    }

    // Validate shipping info
    if (mode === 'delivery') {
      if (!form.name || !form.phone || !form.address || !form.city || !form.district) {
        alert('Vui lòng nhập đầy đủ thông tin giao hàng!');
        return;
      }
    } else if (mode === 'pickup' && !storeId) {
      alert('Vui lòng chọn cửa hàng để nhận!');
      return;
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
        subtotal,
        shipFee,
        total,
      },
      couponCode: couponInfo ? (couponCode || '').trim() : null,
    };

    try {
      setPlacingOrder(true);
      const orderRes = await checkoutOrderApi(payload);

      console.log('✅ Order created:', orderRes);

      // Thanh toán online qua VNPay: chuyển hướng sang cổng thanh toán
      if (form.method === 'vnpay') {
        const orderId = orderRes?._id || orderRes?.id;
        if (!orderId) {
          throw new Error('Không lấy được mã đơn hàng để thanh toán.');
        }
        const paymentUrl = await createVnpayUrlApi(orderId);
        if (!paymentUrl) {
          throw new Error('Không tạo được liên kết thanh toán VNPay.');
        }
        clearCart();
        window.location.href = paymentUrl; // rời trang sang VNPay
        return;
      }

      // COD: hiển thị modal thành công như cũ
      setLastOrder(orderRes);
      clearCart();
      setShowSuccess(true);
    } catch (e) {
      alert(e?.message || 'Không thể tạo đơn hàng.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return {
    // Cart & Form
    cartItems,
    form,
    setForm,

    // Shipping & Store
    mode,
    setMode,
    shipMethod,
    setShipMethod,
    delivery,
    eligibleStores,
    storeId,
    setStoreId,
    pickedStore,

    // Pricing & Order
    shipFee,
    total,
    order,
    shipMethods,
    // Coupon
    couponCode,
    setCouponCode,
    couponInfo,
    discount,
    applyCoupon,
    removeCoupon,

    // Payment
    placingOrder,

    // Modal
    showSuccess,
    setShowSuccess,
    lastOrder,

    // Actions
    placeOrder,
    navigate,
    SHIP_METHODS: shipMethods,
  };
}
