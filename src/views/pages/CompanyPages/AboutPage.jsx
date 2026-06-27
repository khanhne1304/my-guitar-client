import PolicyLayout, { styles as s } from "../PolicyPages/PolicyLayout";

export default function AboutPage() {
  return (
    <PolicyLayout
      title="Giới thiệu công ty"
      intro="Công ty TNHH GuitarMaster là đơn vị chuyên cung cấp nhạc cụ, phụ kiện và nền tảng học guitar trực tuyến tại Việt Nam."
    >
      <h2 style={s.h2}>Về chúng tôi</h2>
      <p style={s.p}>
        GuitarMaster ra đời với sứ mệnh đưa âm nhạc đến gần hơn với mọi người. Chúng tôi
        kết hợp giữa cửa hàng nhạc cụ uy tín và các công cụ học tập hiện đại (luyện hợp âm,
        máy đếm nhịp, chỉnh dây, phân tích hợp âm bằng AI) để hỗ trợ người chơi guitar ở mọi
        trình độ.
      </p>

      <h2 style={s.h2}>Tầm nhìn</h2>
      <p style={s.p}>
        Trở thành nền tảng âm nhạc toàn diện, nơi người dùng vừa mua sắm nhạc cụ chính hãng,
        vừa học tập và kết nối cộng đồng yêu guitar.
      </p>

      <h2 style={s.h2}>Giá trị cốt lõi</h2>
      <ul style={s.ul}>
        <li><strong>Chất lượng:</strong> sản phẩm chính hãng, kiểm định kỹ trước khi giao.</li>
        <li><strong>Tận tâm:</strong> hỗ trợ khách hàng nhanh chóng, chu đáo.</li>
        <li><strong>Đổi mới:</strong> ứng dụng công nghệ AI vào việc học nhạc.</li>
      </ul>
    </PolicyLayout>
  );
}
