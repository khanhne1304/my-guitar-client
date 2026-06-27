import PolicyLayout, { styles as s, HOTLINE } from "./PolicyLayout";

export default function HowToBuyPage() {
  return (
    <PolicyLayout
      title="Hướng dẫn mua hàng"
      intro="Chỉ với vài bước đơn giản, bạn có thể đặt mua nhạc cụ và phụ kiện trên My Guitar."
    >
      <h2 style={s.h2}>Bước 1: Tìm sản phẩm</h2>
      <p style={s.p}>
        Sử dụng thanh tìm kiếm hoặc duyệt theo danh mục (Guitar, Phụ kiện...) để tìm sản phẩm
        bạn muốn. Nhấn vào sản phẩm để xem chi tiết, hình ảnh, thông số và giá.
      </p>

      <h2 style={s.h2}>Bước 2: Thêm vào giỏ hàng</h2>
      <ul style={s.ul}>
        <li>Chọn số lượng và nhấn <strong>Thêm vào giỏ hàng</strong>.</li>
        <li>Bạn có thể tiếp tục mua sắm hoặc vào biểu tượng giỏ hàng để xem lại.</li>
        <li>Nhấn vào biểu tượng trái tim để lưu sản phẩm vào danh sách yêu thích.</li>
      </ul>

      <h2 style={s.h2}>Bước 3: Tiến hành thanh toán</h2>
      <ul style={s.ul}>
        <li>Vào <strong>Giỏ hàng</strong> → kiểm tra sản phẩm, số lượng → nhấn <strong>Thanh toán</strong>.</li>
        <li>Nhập thông tin giao hàng hoặc chọn nhận tại cửa hàng.</li>
        <li>Áp dụng mã giảm giá (nếu có).</li>
      </ul>

      <h2 style={s.h2}>Bước 4: Chọn phương thức thanh toán</h2>
      <ul style={s.ul}>
        <li><strong>COD</strong>: thanh toán tiền mặt khi nhận hàng.</li>
        <li><strong>VNPay</strong>: thanh toán online qua thẻ ATM nội địa / mã QR.</li>
      </ul>

      <h2 style={s.h2}>Bước 5: Hoàn tất & theo dõi đơn</h2>
      <p style={s.p}>
        Sau khi đặt hàng thành công, bạn có thể theo dõi trạng thái đơn trong mục
        <strong> Lịch sử đơn hàng</strong>. Mọi thắc mắc vui lòng gọi hotline{" "}
        <strong>{HOTLINE}</strong>.
      </p>
    </PolicyLayout>
  );
}
