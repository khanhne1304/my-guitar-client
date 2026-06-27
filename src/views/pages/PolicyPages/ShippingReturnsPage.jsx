import PolicyLayout, { styles as s, HOTLINE } from "./PolicyLayout";

export default function ShippingReturnsPage() {
  return (
    <PolicyLayout
      title="Giao hàng - Đổi trả"
      intro="Chính sách giao hàng và đổi trả của My Guitar nhằm đảm bảo bạn nhận được sản phẩm nhanh chóng, đúng mô tả và an tâm khi mua sắm."
    >
      <h2 style={s.h2}>1. Phạm vi & thời gian giao hàng</h2>
      <ul style={s.ul}>
        <li>Giao hàng toàn quốc thông qua các đối tác vận chuyển uy tín.</li>
        <li>Nội thành: 1–2 ngày làm việc. Tỉnh/thành khác: 2–5 ngày làm việc.</li>
        <li>Thời gian có thể thay đổi vào dịp cao điểm, lễ tết hoặc do thời tiết.</li>
      </ul>

      <h2 style={s.h2}>2. Phí giao hàng</h2>
      <ul style={s.ul}>
        <li>Phí ship được tính theo phương thức và khoảng cách, hiển thị rõ ở bước thanh toán.</li>
        <li>Có thể áp dụng miễn phí vận chuyển theo chương trình khuyến mãi từng thời điểm.</li>
      </ul>

      <h2 style={s.h2}>3. Kiểm tra khi nhận hàng</h2>
      <p style={s.p}>
        Bạn vui lòng kiểm tra ngoại quan, số lượng và phụ kiện ngay khi nhận. Nếu phát hiện
        sai sót hoặc hư hỏng do vận chuyển, hãy từ chối nhận hoặc liên hệ ngay với chúng tôi.
      </p>

      <h2 style={s.h2}>4. Điều kiện đổi trả</h2>
      <ul style={s.ul}>
        <li>Thời hạn yêu cầu đổi/trả: trong vòng <strong>7 ngày</strong> kể từ khi nhận hàng.</li>
        <li>Sản phẩm còn nguyên tem, nhãn, phụ kiện, hộp và chưa qua sử dụng/hư hỏng do người dùng.</li>
        <li>Có hoá đơn hoặc thông tin đơn hàng hợp lệ.</li>
      </ul>

      <h2 style={s.h2}>5. Các trường hợp được đổi/trả</h2>
      <ul style={s.ul}>
        <li>Sản phẩm bị lỗi kỹ thuật do nhà sản xuất.</li>
        <li>Giao sai mẫu mã, sai số lượng so với đơn đặt.</li>
        <li>Sản phẩm hư hỏng do quá trình vận chuyển.</li>
      </ul>

      <h2 style={s.h2}>6. Quy trình đổi trả</h2>
      <ul style={s.ul}>
        <li>Liên hệ hotline <strong>{HOTLINE}</strong> hoặc gửi yêu cầu kèm mã đơn hàng và hình ảnh sản phẩm.</li>
        <li>Bộ phận CSKH xác nhận và hướng dẫn gửi trả/đổi sản phẩm.</li>
        <li>Hoàn tiền hoặc đổi sản phẩm sau khi kiểm tra, trong vòng 3–7 ngày làm việc.</li>
      </ul>
    </PolicyLayout>
  );
}
