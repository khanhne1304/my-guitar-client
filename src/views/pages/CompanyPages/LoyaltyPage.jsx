import PolicyLayout, { styles as s } from "../PolicyPages/PolicyLayout";

export default function LoyaltyPage() {
  return (
    <PolicyLayout
      title="Chương trình Khách hàng thân thiết"
      intro="Tri ân khách hàng đồng hành cùng GuitarMaster với nhiều ưu đãi hấp dẫn."
    >
      <h2 style={s.h2}>Quyền lợi thành viên</h2>
      <ul style={s.ul}>
        <li>Tích điểm cho mỗi đơn hàng và quy đổi thành ưu đãi giảm giá.</li>
        <li>Ưu đãi sinh nhật và các dịp đặc biệt.</li>
        <li>Nhận thông báo sớm về sản phẩm mới và chương trình khuyến mãi.</li>
        <li>Ưu tiên hỗ trợ và bảo hành.</li>
      </ul>

      <h2 style={s.h2}>Hạng thành viên</h2>
      <ul style={s.ul}>
        <li><strong>Thành viên:</strong> đăng ký tài khoản miễn phí.</li>
        <li><strong>Bạc / Vàng / Kim cương:</strong> nâng hạng theo tổng giá trị mua sắm, ưu đãi tăng dần.</li>
      </ul>

      <h2 style={s.h2}>Cách tham gia</h2>
      <p style={s.p}>
        Chỉ cần <strong>đăng ký tài khoản</strong> và mua sắm tại GuitarMaster, bạn sẽ tự
        động trở thành thành viên và bắt đầu tích điểm.
      </p>
    </PolicyLayout>
  );
}
