import PolicyLayout, { styles as s, CONTACT_EMAIL } from "./PolicyLayout";

export default function PaymentSecurityPage() {
  return (
    <PolicyLayout
      title="Thanh toán & Bảo mật"
      intro="My Guitar hỗ trợ nhiều phương thức thanh toán linh hoạt và cam kết bảo mật thông tin của bạn."
    >
      <h2 style={s.h2}>1. Phương thức thanh toán</h2>
      <ul style={s.ul}>
        <li><strong>Thanh toán khi nhận hàng (COD):</strong> trả tiền mặt cho nhân viên giao hàng.</li>
        <li><strong>Thanh toán online qua VNPay:</strong> hỗ trợ thẻ ATM nội địa và quét mã QR của hầu hết ngân hàng tại Việt Nam.</li>
      </ul>

      <h2 style={s.h2}>2. Quy trình thanh toán VNPay</h2>
      <ul style={s.ul}>
        <li>Chọn phương thức <strong>VNPay</strong> ở bước thanh toán.</li>
        <li>Hệ thống chuyển bạn sang cổng thanh toán an toàn của VNPay.</li>
        <li>Sau khi thanh toán, bạn được chuyển về trang kết quả và đơn hàng cập nhật trạng thái tự động.</li>
      </ul>

      <h2 style={s.h2}>3. Cam kết bảo mật</h2>
      <ul style={s.ul}>
        <li>Mọi giao dịch online được mã hoá và xử lý qua cổng thanh toán đạt chuẩn bảo mật.</li>
        <li>Chúng tôi <strong>không lưu trữ</strong> thông tin thẻ/mật khẩu ngân hàng của bạn.</li>
        <li>Thông tin cá nhân được bảo vệ và chỉ dùng cho mục đích xử lý đơn hàng.</li>
      </ul>

      <h2 style={s.h2}>4. Lưu ý an toàn</h2>
      <ul style={s.ul}>
        <li>Không chia sẻ mã OTP, mật khẩu ngân hàng cho bất kỳ ai.</li>
        <li>Chỉ thanh toán trên trang chính thức của chúng tôi và cổng VNPay.</li>
      </ul>

      <p style={s.p}>
        Nếu nghi ngờ giao dịch bất thường, vui lòng liên hệ{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </PolicyLayout>
  );
}
