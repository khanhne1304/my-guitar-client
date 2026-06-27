import PolicyLayout, { styles as s, HOTLINE } from "../PolicyPages/PolicyLayout";

export default function InstallmentPage() {
  return (
    <PolicyLayout
      title="Mua trả góp"
      intro="GuitarMaster hỗ trợ mua trả góp giúp bạn dễ dàng sở hữu nhạc cụ yêu thích."
    >
      <h2 style={s.h2}>Hình thức trả góp</h2>
      <ul style={s.ul}>
        <li>Trả góp qua thẻ tín dụng của các ngân hàng liên kết.</li>
        <li>Trả góp qua công ty tài chính (chỉ cần CCCD và một số giấy tờ cơ bản).</li>
      </ul>

      <h2 style={s.h2}>Điều kiện áp dụng</h2>
      <ul style={s.ul}>
        <li>Áp dụng cho đơn hàng có giá trị từ một mức nhất định (tùy chương trình).</li>
        <li>Khách hàng từ 18 tuổi trở lên, có giấy tờ tùy thân hợp lệ.</li>
        <li>Kỳ hạn trả góp linh hoạt: 3, 6, 9, 12 tháng.</li>
      </ul>

      <h2 style={s.h2}>Quy trình đăng ký</h2>
      <ul style={s.ul}>
        <li>Chọn sản phẩm và liên hệ hotline <strong>{HOTLINE}</strong> hoặc tới showroom.</li>
        <li>Nhân viên tư vấn gói trả góp phù hợp và hỗ trợ làm hồ sơ.</li>
        <li>Duyệt hồ sơ nhanh chóng và nhận sản phẩm.</li>
      </ul>

      <p style={s.p}>
        Lưu ý: lãi suất và phí trả góp tùy thuộc vào ngân hàng/công ty tài chính tại thời
        điểm đăng ký.
      </p>
    </PolicyLayout>
  );
}
