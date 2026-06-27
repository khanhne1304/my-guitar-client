import { useState } from "react";
import PolicyLayout, { styles as s, CONTACT_EMAIL, HOTLINE } from "../PolicyPages/PolicyLayout";

const field = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 15,
  marginBottom: 12,
};
const btn = {
  background: "#ffd000",
  color: "#000",
  fontWeight: 700,
  border: "none",
  borderRadius: 8,
  padding: "11px 22px",
  cursor: "pointer",
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Góp ý từ ${form.name || "khách hàng"}`);
    const body = encodeURIComponent(
      `Họ tên: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <PolicyLayout
      title="Liên hệ / Góp ý"
      intro="Chúng tôi luôn lắng nghe ý kiến của bạn. Hãy liên hệ với GuitarMaster qua các kênh dưới đây."
    >
      <h2 style={s.h2}>Thông tin liên hệ</h2>
      <ul style={s.ul}>
        <li>Hotline: <a href={`tel:${HOTLINE.replace(/\s/g, "")}`}>{HOTLINE}</a> (Miễn phí)</li>
        <li>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
        <li>Địa chỉ: Số 1, Võ Văn Ngân, P. Linh Chiểu, TP Thủ Đức, TP.HCM</li>
        <li>Thời gian phục vụ: 8h00 - 22h00 (tất cả các ngày)</li>
      </ul>

      <h2 style={s.h2}>Gửi góp ý</h2>
      <form onSubmit={handleSubmit}>
        <input
          style={field}
          placeholder="Họ và tên"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          style={field}
          type="email"
          placeholder="Email của bạn"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <textarea
          style={{ ...field, minHeight: 120, resize: "vertical" }}
          placeholder="Nội dung góp ý..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />
        <button type="submit" style={btn}>
          Gửi góp ý
        </button>
      </form>
    </PolicyLayout>
  );
}
