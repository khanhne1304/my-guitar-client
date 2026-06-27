import PolicyLayout, { styles as s } from "../PolicyPages/PolicyLayout";

const SHOWROOMS = [
  {
    name: "GuitarMaster - Thủ Đức",
    address: "Số 1, Võ Văn Ngân, P. Linh Chiểu, TP Thủ Đức, TP.HCM",
    phone: "1800 9876",
    hours: "8h00 - 22h00",
  },
  {
    name: "GuitarMaster - Quận 1",
    address: "123 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM",
    phone: "0972 066 123",
    hours: "8h00 - 22h00",
  },
  {
    name: "GuitarMaster - Hà Nội",
    address: "45 Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội",
    phone: "1800 9876",
    hours: "8h00 - 21h30",
  },
];

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "16px 18px",
  marginBottom: 14,
  background: "#fff",
};

export default function ShowroomsPage() {
  return (
    <PolicyLayout
      title="Hệ thống showroom, đại lý"
      intro="Ghé thăm các showroom của GuitarMaster để trải nghiệm trực tiếp sản phẩm và nhận tư vấn."
    >
      {SHOWROOMS.map((shop) => (
        <div key={shop.name} style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{shop.name}</div>
          <div style={s.p}>📍 {shop.address}</div>
          <div style={s.p}>
            ☎️ <a href={`tel:${shop.phone.replace(/\s/g, "")}`}>{shop.phone}</a> · 🕒 {shop.hours}
          </div>
        </div>
      ))}

      <h2 style={s.h2}>Trở thành đại lý</h2>
      <p style={s.p}>
        Nếu bạn quan tâm đến việc hợp tác phân phối, vui lòng liên hệ hotline{" "}
        <strong>1800 9876</strong> để được tư vấn chính sách đại lý.
      </p>
    </PolicyLayout>
  );
}
