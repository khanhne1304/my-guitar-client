import { Link } from "react-router-dom";
import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";

const POLICIES = [
  {
    to: "/shipping-returns",
    title: "Giao hàng - Đổi trả",
    desc: "Thời gian, phí giao hàng và điều kiện đổi trả sản phẩm.",
  },
  {
    to: "/how-to-buy",
    title: "Hướng dẫn mua hàng",
    desc: "Các bước đặt mua sản phẩm trên My Guitar.",
  },
  {
    to: "/payment-security",
    title: "Thanh toán & Bảo mật",
    desc: "Phương thức thanh toán COD, VNPay và cam kết bảo mật.",
  },
  {
    to: "/warranty-policy",
    title: "Chính sách bảo hành",
    desc: "Thời hạn, điều kiện và quy trình bảo hành sản phẩm.",
  },
  {
    to: "/warranty",
    title: "Tra cứu - Kích hoạt bảo hành",
    desc: "Tra cứu tình trạng và cách kích hoạt bảo hành.",
  },
  {
    to: "/privacy-policy",
    title: "Chính sách quyền riêng tư",
    desc: "Cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.",
  },
];

const wrap = {
  maxWidth: 980,
  margin: "0 auto",
  padding: "32px 20px 64px",
  color: "#1f2937",
};
const h1 = { fontSize: 32, fontWeight: 800, marginBottom: 8 };
const sub = { color: "#6b7280", marginBottom: 28 };
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 20,
};
const card = {
  display: "block",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: "20px 22px",
  textDecoration: "none",
  color: "inherit",
  background: "#fff",
  boxShadow: "0 6px 18px rgba(0,0,0,.05)",
  transition: "transform .12s ease, box-shadow .12s ease",
};
const cardTitle = { fontSize: 18, fontWeight: 700, marginBottom: 6, color: "#111827" };
const cardDesc = { fontSize: 14, color: "#6b7280", lineHeight: 1.6 };
const arrow = { marginTop: 12, color: "#b45309", fontWeight: 700, fontSize: 14 };

export default function PolicyHubPage() {
  return (
    <div>
      <Header />
      <main style={wrap}>
        <h1 style={h1}>Chính sách & Hỗ trợ</h1>
        <p style={sub}>
          Tổng hợp các chính sách và hướng dẫn của My Guitar. Nhấn vào từng mục để xem chi tiết.
        </p>

        <div style={grid}>
          {POLICIES.map((p) => (
            <Link key={p.to} to={p.to} style={card}>
              <div style={cardTitle}>{p.title}</div>
              <div style={cardDesc}>{p.desc}</div>
              <div style={arrow}>Xem chi tiết →</div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
