import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";

const wrap = {
  maxWidth: 560,
  margin: "0 auto",
  padding: "64px 20px",
  textAlign: "center",
};
const iconBox = (bg) => ({
  width: 88,
  height: 88,
  borderRadius: "50%",
  background: bg,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 24px",
  fontSize: 48,
  fontWeight: 700,
});
const h1 = { fontSize: 26, fontWeight: 800, marginBottom: 10 };
const desc = { color: "#6b7280", marginBottom: 28, lineHeight: 1.6 };
const btnRow = { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" };
const btnPrimary = {
  background: "#ffd000",
  color: "#000",
  fontWeight: 700,
  padding: "10px 20px",
  borderRadius: 8,
  textDecoration: "none",
};
const btnGhost = {
  border: "1px solid #d1d5db",
  color: "#1f2937",
  fontWeight: 600,
  padding: "10px 20px",
  borderRadius: 8,
  textDecoration: "none",
};

const CONTENT = {
  success: {
    bg: "#16a34a",
    icon: "✓",
    title: "Thanh toán thành công!",
    desc: "Cảm ơn bạn. Đơn hàng đã được thanh toán qua VNPay và đang được xử lý.",
  },
  fail: {
    bg: "#dc2626",
    icon: "✕",
    title: "Thanh toán không thành công",
    desc: "Giao dịch đã bị hủy hoặc thất bại. Đơn hàng của bạn vẫn ở trạng thái chờ thanh toán, bạn có thể thử lại trong lịch sử đơn hàng.",
  },
  invalid: {
    bg: "#d97706",
    icon: "!",
    title: "Không xác thực được giao dịch",
    desc: "Chữ ký giao dịch không hợp lệ. Vui lòng liên hệ hỗ trợ nếu bạn đã bị trừ tiền.",
  },
};

export default function PaymentResultPage() {
  const [params] = useSearchParams();
  const status = params.get("status") || "fail";
  const code = params.get("code") || "";

  const c = useMemo(() => CONTENT[status] || CONTENT.fail, [status]);

  return (
    <div>
      <Header />
      <main style={wrap}>
        <div style={iconBox(c.bg)}>{c.icon}</div>
        <h1 style={h1}>{c.title}</h1>
        <p style={desc}>
          {c.desc}
          {code && status !== "success" ? (
            <>
              <br />
              <small>Mã phản hồi VNPay: {code}</small>
            </>
          ) : null}
        </p>
        <div style={btnRow}>
          <Link to="/checkout-history" style={btnPrimary}>
            Xem đơn hàng của tôi
          </Link>
          <Link to="/" style={btnGhost}>
            Về trang chủ
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
