import PolicyLayout, { styles as s, HOTLINE } from "./PolicyLayout";

export default function WarrantyPolicyPage() {
  return (
    <PolicyLayout
      title="Chính sách bảo hành"
      intro="My Guitar cam kết bảo hành sản phẩm theo tiêu chuẩn của nhà sản xuất, đảm bảo quyền lợi cho khách hàng."
    >
      <h2 style={s.h2}>1. Thời hạn bảo hành</h2>
      <ul style={s.ul}>
        <li>Thời hạn bảo hành theo từng sản phẩm/nhà sản xuất (thường 6–12 tháng).</li>
        <li>Thời gian bảo hành tính từ ngày mua ghi trên hoá đơn/đơn hàng.</li>
      </ul>

      <h2 style={s.h2}>2. Điều kiện được bảo hành</h2>
      <ul style={s.ul}>
        <li>Sản phẩm còn trong thời hạn bảo hành.</li>
        <li>Có hoá đơn mua hàng hoặc thông tin đơn hàng hợp lệ.</li>
        <li>Lỗi do nhà sản xuất (linh kiện, kỹ thuật) trong điều kiện sử dụng bình thường.</li>
      </ul>

      <h2 style={s.h2}>3. Các trường hợp không được bảo hành</h2>
      <ul style={s.ul}>
        <li>Hết thời hạn bảo hành.</li>
        <li>Hư hỏng do rơi vỡ, va đập, vào nước, cháy nổ, thiên tai.</li>
        <li>Tự ý sửa chữa, can thiệp hoặc sử dụng sai hướng dẫn.</li>
        <li>Tem bảo hành bị rách, tẩy xoá hoặc không còn nguyên vẹn.</li>
      </ul>

      <h2 style={s.h2}>4. Quy trình bảo hành</h2>
      <ul style={s.ul}>
        <li>Liên hệ hotline <strong>{HOTLINE}</strong> hoặc mang sản phẩm đến cửa hàng.</li>
        <li>Cung cấp thông tin đơn hàng và mô tả tình trạng lỗi.</li>
        <li>Chúng tôi tiếp nhận, kiểm tra và xử lý theo chính sách của nhà sản xuất.</li>
      </ul>
    </PolicyLayout>
  );
}
