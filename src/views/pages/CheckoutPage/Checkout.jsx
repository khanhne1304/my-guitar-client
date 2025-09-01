// src/views/pages/checkout/Checkout.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./checkout.module.css";
import Header from "../../components/HomePageItems/Header/Header";
import Footer from "../../components/HomePageItems/Footer/HomePageFooter";
import { MOCK_PRODUCTS } from "../../components/Data/dataProduct";
import { useCart } from "../../../context/CartContext";
import { STORES } from "../../components/Data/stores";
import SuccessModal from "../../components/Modal/SuccessModal/SuccessModal";

const fmtVND = (v) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v || 0);

// 3 phương thức giao
const SHIP_METHODS = [
  { id: "economy", name: "Tiết kiệm", eta: "2–4 ngày", fee: 15000 },
  { id: "standard", name: "Nhanh", eta: "24–48 giờ", fee: 30000 },
  { id: "express", name: "Hỏa tốc", eta: "2–4 giờ (nội thành)", fee: 80000 },
];

export default function Checkout() {
  const navigate = useNavigate();

  // Lấy dữ liệu giỏ hàng + helpers từ CartContext (đảm bảo context đã có subtotal/clearCart)
  const { cartItems, subtotal, clearCart } = useCart();

  // Hiển thị modal thành công
  const [showSuccess, setShowSuccess] = useState(false);

  // Tab: giao tận nơi / nhận tại cửa hàng
  const [mode, setMode] = useState("delivery"); // "delivery" | "pickup"

  // lấy thời gian giao đã xác nhận ở trang giỏ hàng (nếu có)
  const [delivery, setDelivery] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("deliveryTime");
      setDelivery(raw ? JSON.parse(raw) : null);
    } catch {
      setDelivery(null);
    }
  }, []);

  // form giao tận nơi
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    country: "Vietnam",
    address: "",
    district: "",
    method: "cod", // cod | onpay-atm | onpay-visa | onpay-installment
    note: "",
  });

  // cửa hàng đủ tồn kho khi nhận tại cửa hàng
  const eligibleStores = useMemo(() => {
    if (!cartItems.length) return [];
    return STORES.filter((s) =>
      cartItems.every((it) => (s.inventory[it.slug] || 0) >= it.qty)
    );
  }, [cartItems]);

  const [storeId, setStoreId] = useState("");
  const pickedStore = useMemo(
    () => eligibleStores.find((s) => s.id === storeId),
    [eligibleStores, storeId]
  );

  // phương thức giao + phí ship
  const [shipMethod, setShipMethod] = useState(SHIP_METHODS[1].id);
  const shipFee = useMemo(() => {
    if (mode === "pickup") return 0;
    const found = SHIP_METHODS.find((m) => m.id === shipMethod);
    return found ? found.fee : 0;
  }, [mode, shipMethod]);

  // tổng thanh toán
  const total = useMemo(() => subtotal + shipFee, [subtotal, shipFee]);

  // ===== VNPay QR (demo) =====
  const payIsOnline = ["onpay-atm", "onpay-visa"].includes(form.method);
  const [orderId] = useState(() => `MM${Date.now()}`); // mã đơn tạm
  const orderInfo = `Thanh toan don ${orderId}`;
  // payload demo (thực tế hãy dùng payload hợp lệ từ backend)
  const vnpayPayload = `VNPAY|ORDER=${orderId}|AMOUNT=${total}|INFO=${orderInfo}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    vnpayPayload
  )}`;

  // Chỉ hiển thị QR sau khi bấm "Đặt hàng" (nếu là phương thức online)
  const [showQR, setShowQR] = useState(false);
  // Người dùng đã xác nhận đã thanh toán (đã quét QR)
  const [paid, setPaid] = useState(false);

  // ===== Đặt hàng =====
  const placeOrder = () => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng trống.");
      navigate("/cart");
      return;
    }

    if (mode === "delivery") {
      if (!form.name || !form.phone || !form.address || !form.district) {
        alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
        return;
      }
    } else if (!storeId) {
      alert("Vui lòng chọn cửa hàng để nhận!");
      return;
    }

    // Nếu là thanh toán online, lần đầu bấm Đặt hàng -> hiện QR (chưa hoàn tất)
    if (payIsOnline) {
      if (!showQR) {
        setShowQR(true);
        // Cho người dùng quét QR rồi xác nhận
        return;
      }
      // QR đã hiển thị nhưng chưa xác nhận đã thanh toán
      if (!paid) {
        alert("Vui lòng quét QR VNPay và bấm 'Tôi đã thanh toán' để tiếp tục.");
        return;
      }
      // Đã paid = true => cho phép hoàn tất
    }

    // Ở đây coi như đơn đã hoàn tất
    clearCart();
    setShowSuccess(true);
  };

  return (
    <div className={styles.page}>
      <Header products={MOCK_PRODUCTS} />

      <main className={styles.main}>
        <div className={styles.container}>
          <h2 className={styles.brand}>
            My Music <span>Shop</span>
          </h2>

          <div className={styles.grid}>
            {/* LEFT */}
            <section className={styles.left}>
              {/* tab giao/nhận */}
              <div className={styles.box}>
                <div className={styles.boxHead}>
                  <button
                    className={`${styles.shipTab} ${
                      mode === "delivery" ? styles.active : ""
                    }`}
                    onClick={() => {
                      setMode("delivery");
                    }}
                  >
                    <span className={styles.truck}>🚚</span> Giao tận nơi
                  </button>
                  <button
                    className={`${styles.shipTab} ${
                      mode === "pickup" ? styles.active : ""
                    }`}
                    onClick={() => {
                      setMode("pickup");
                    }}
                  >
                    <span>🏬</span> Nhận tại cửa hàng
                  </button>
                </div>

                {mode === "delivery" ? (
                  <div className={styles.form}>
                    <input
                      className={styles.input}
                      placeholder="Nhập họ và tên"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <input
                      className={styles.input}
                      placeholder="Nhập số điện thoại"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                    <input
                      className={styles.input}
                      placeholder="Nhập email (không bắt buộc)"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <input className={styles.input} value={form.country} readOnly />
                    <input
                      className={styles.input}
                      placeholder="Địa chỉ, tên đường"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                    <input
                      className={styles.input}
                      placeholder="Tỉnh/TP, Quận/Huyện, Phường/Xã"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className={styles.storeList}>
                    {eligibleStores.length ? (
                      eligibleStores.map((s) => (
                        <label key={s.id} className={styles.storeItem}>
                          <input
                            type="radio"
                            name="store"
                            value={s.id}
                            checked={storeId === s.id}
                            onChange={(e) => setStoreId(e.target.value)}
                          />
                          <div className={styles.storeContent}>
                            <div className={styles.storeName}>{s.name}</div>
                            <div className={styles.storeAddr}>{s.address}</div>
                            <div className={styles.storePhone}>📞 {s.phone}</div>
                            <div className={styles.storeStock}>
                              {cartItems.map((it) => (
                                <span key={it._id} className={styles.tag}>
                                  {it.sku || it.name}: {s.inventory[it.slug] || 0} sp
                                </span>
                              ))}
                            </div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className={styles.storeEmpty}>
                        Không có cửa hàng nào còn đủ hàng cho đơn của bạn.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Phương thức giao hàng */}
              <div className={styles.box}>
                <div className={styles.boxTitle}>Phương thức giao hàng</div>
                {mode === "delivery" ? (
                  <div className={styles.shipMethods}>
                    {SHIP_METHODS.map((m) => (
                      <label key={m.id} className={styles.shipMethod}>
                        <input
                          type="radio"
                          name="ship-method"
                          value={m.id}
                          checked={shipMethod === m.id}
                          onChange={(e) => {
                            setShipMethod(e.target.value);
                          }}
                        />
                        <div className={styles.shipMeta}>
                          <div className={styles.shipName}>
                            {m.name} <span className={styles.eta}>({m.eta})</span>
                          </div>
                          <div className={styles.shipFee}>{fmtVND(m.fee)}</div>
                        </div>
                      </label>
                    ))}
                    <div className={styles.shipHint}>
                      * Hỏa tốc chỉ áp dụng nội thành; thời gian có thể thay đổi theo
                      khu vực/khung giờ.
                    </div>
                  </div>
                ) : (
                  <div className={styles.shipPlaceholder}>
                    Bạn đã chọn <b>nhận tại cửa hàng</b>. Phí vận chuyển = 0đ.
                  </div>
                )}
              </div>

              {/* Phương thức thanh toán */}
              <div className={styles.box}>
                <div className={styles.boxTitle}>Phương thức thanh toán</div>

                <label className={styles.payRow}>
                  <input
                    type="radio"
                    name="pay"
                    value="cod"
                    checked={form.method === "cod"}
                    onChange={(e) => {
                      setPaid(false);
                      setShowQR(false);
                      setForm({ ...form, method: e.target.value });
                    }}
                  />
                  <span> Thanh toán khi giao hàng (COD)</span>
                </label>

                <label className={styles.payRow}>
                  <input
                    type="radio"
                    name="pay"
                    value="onpay-atm"
                    checked={form.method === "onpay-atm"}
                    onChange={(e) => {
                      setPaid(false);
                      setShowQR(false);
                      setForm({ ...form, method: e.target.value });
                    }}
                  />
                  <span> Thanh toán online bằng thẻ ATM nội địa & ví điện tử (VNPay)</span>
                </label>

                <label className={styles.payRow}>
                  <input
                    type="radio"
                    name="pay"
                    value="onpay-visa"
                    checked={form.method === "onpay-visa"}
                    onChange={(e) => {
                      setPaid(false);
                      setShowQR(false);
                      setForm({ ...form, method: e.target.value });
                    }}
                  />
                  <span> Thẻ Visa/Master/JCB/American Express/CUP (VNPay)</span>
                </label>

                <label className={styles.payRow}>
                  <input
                    type="radio"
                    name="pay"
                    value="onpay-installment"
                    checked={form.method === "onpay-installment"}
                    onChange={(e) => {
                      setPaid(false);
                      setShowQR(false);
                      setForm({ ...form, method: e.target.value });
                    }}
                  />
                  <span> Thanh toán trả góp qua thẻ tín dụng (≥ 5.000.000đ)</span>
                </label>
              </div>

              {/* Ghi chú */}
              <div className={styles.box}>
                <div className={styles.boxTitle}>Ghi chú đơn hàng</div>
                <textarea
                  className={styles.textarea}
                  placeholder="Ví dụ: để hàng ở bảo vệ, gọi trước khi giao..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>
            </section>

            {/* RIGHT */}
            <aside className={styles.right}>
              <div className={styles.cartBox}>
                <div className={styles.cartTitle}>Giỏ hàng</div>
                {cartItems.map((it) => (
                  <div key={it._id} className={styles.cartRow}>
                    <div className={styles.thumb}>
                      <img src={it.image} alt={it.name} />
                    </div>
                    <div className={styles.cinfo}>
                      <div className={styles.cname}>{it.name}</div>
                      <div className={styles.csku}>{it.sku}</div>
                    </div>
                    <div className={styles.cqty}>x{it.qty}</div>
                    <div className={styles.cprice}>{fmtVND(it.price)}</div>
                  </div>
                ))}

                {mode === "delivery" ? (
                  <div className={styles.delivery}>
                    <span>Delivery Time :</span>{" "}
                    <b>
                      {delivery
                        ? `${delivery.dateLabel} ${delivery.timeSlot}`
                        : "Chưa chọn (hãy xác nhận ở Giỏ hàng)"}
                    </b>
                  </div>
                ) : (
                  <div className={styles.delivery}>
                    <span>Pickup at :</span>{" "}
                    <b>
                      {pickedStore
                        ? `${pickedStore.name} – ${pickedStore.address}`
                        : "Chưa chọn cửa hàng"}
                    </b>
                  </div>
                )}
              </div>

              {/* VNPay QR: chỉ hiển thị sau khi bấm Đặt hàng lần đầu với phương thức online */}
              {payIsOnline && showQR && (
                <div className={styles.qrBox}>
                  <div className={styles.qrTitle}>Thanh toán VNPay QR</div>
                  <div className={styles.qrMeta}>
                    <div>
                      <div>
                        Mã đơn: <b>{orderId}</b>
                      </div>
                      <div>
                        Số tiền: <b>{fmtVND(total)}</b>
                      </div>
                      <div>
                        Nội dung: <b>{orderInfo}</b>
                      </div>
                    </div>
                    <img className={styles.qrImg} src={qrUrl} alt="VNPay QR" />
                  </div>
                  <div className={styles.qrNote}>
                    * Quét mã bằng ứng dụng ngân hàng/VNPay. (Demo, không phát sinh giao dịch thật)
                  </div>
                  <div className={styles.qrActions}>
                    <button className={styles.grayBtn} onClick={() => setPaid(true)}>
                      Tôi đã thanh toán
                    </button>
                    {paid && <span className={styles.paidOk}>✓ Đã xác nhận thanh toán</span>}
                  </div>
                </div>
              )}

              <div className={styles.couponBox}>
                <div className={styles.cartTitle}>Mã khuyến mãi</div>
                <div className={styles.couponRow}>
                  <input className={styles.input} placeholder="Nhập mã khuyến mãi" />
                  <button className={styles.grayBtn}>Áp dụng</button>
                </div>
              </div>

              <div className={styles.summary}>
                <div className={styles.sumRow}>
                  <span>Tổng tiền hàng</span>
                  <b>{fmtVND(subtotal)}</b>
                </div>
                <div className={styles.sumRow}>
                  <span>Phí vận chuyển</span>
                  <b>{fmtVND(shipFee)}</b>
                </div>
                <div className={`${styles.sumRow} ${styles.sumTotal}`}>
                  <span>Tổng thanh toán</span>
                  <b>{fmtVND(total)}</b>
                </div>

                <button className={styles.placeBtn} onClick={placeOrder}>
                  Đặt hàng
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal thành công */}
      <SuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/"); // đóng -> về trang chủ
        }}
        onContinue={() => {
          setShowSuccess(false);
          navigate("/productsCategory"); // tiếp tục mua sắm
        }}
      />
    </div>
  );
}
