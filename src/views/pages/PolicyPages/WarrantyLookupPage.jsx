import { useState } from "react";
import { Link } from "react-router-dom";
import PolicyLayout, { styles as s, HOTLINE, CONTACT_EMAIL } from "./PolicyLayout";

const inputStyle = {
  flex: 1,
  minWidth: 0,
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 15,
};
const btnStyle = {
  background: "#ffd000",
  color: "#000",
  fontWeight: 700,
  border: "none",
  borderRadius: 8,
  padding: "10px 18px",
  cursor: "pointer",
};
const noteBox = {
  marginTop: 14,
  padding: "12px 14px",
  borderRadius: 8,
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  color: "#7c2d12",
};

export default function WarrantyLookupPage() {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleLookup = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PolicyLayout
      title="Tra cứu - Kích hoạt bảo hành"
      intro="Tra cứu tình trạng bảo hành sản phẩm bằng mã đơn hàng hoặc số serial."
    >
      <h2 style={s.h2}>Tra cứu nhanh</h2>
      <form
        onSubmit={handleLookup}
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}
      >
        <input
          style={inputStyle}
          placeholder="Nhập mã đơn hàng hoặc số serial sản phẩm"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit" style={btnStyle}>
          Tra cứu
        </button>
      </form>

      {submitted ? (
        <div style={noteBox}>
          {code.trim() ? (
            <>
              Để tra cứu chi tiết bảo hành cho mã <strong>{code.trim()}</strong>, vui lòng
              xem trong <Link to="/checkout-history">Lịch sử đơn hàng</Link> của bạn hoặc
              liên hệ hotline <strong>{HOTLINE}</strong> để được hỗ trợ nhanh nhất.
            </>
          ) : (
            <>Vui lòng nhập mã đơn hàng hoặc số serial để tra cứu.</>
          )}
        </div>
      ) : null}

      <h2 style={s.h2}>Cách kích hoạt bảo hành</h2>
      <ul style={s.ul}>
        <li>Bảo hành được kích hoạt tự động theo ngày mua ghi trên đơn hàng.</li>
        <li>Giữ lại hoá đơn / thông tin đơn hàng để làm căn cứ bảo hành.</li>
        <li>
          Đăng nhập và vào <Link to="/checkout-history">Lịch sử đơn hàng</Link> để xem các
          sản phẩm đã mua và thời điểm mua.
        </li>
      </ul>

      <h2 style={s.h2}>Cần hỗ trợ?</h2>
      <p style={s.p}>
        Liên hệ hotline <strong>{HOTLINE}</strong> hoặc email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> để được hướng dẫn về bảo hành
        và sửa chữa.
      </p>
    </PolicyLayout>
  );
}
