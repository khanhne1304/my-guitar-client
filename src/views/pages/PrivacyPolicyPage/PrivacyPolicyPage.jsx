import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";

const LAST_UPDATED = "21/06/2026";
const CONTACT_EMAIL = "chikhanhphanle@gmail.com";

const wrap = {
  maxWidth: 880,
  margin: "0 auto",
  padding: "32px 20px 64px",
  lineHeight: 1.7,
  color: "#1f2937",
};
const h1 = { fontSize: 32, fontWeight: 800, marginBottom: 8 };
const meta = { color: "#6b7280", marginBottom: 28 };
const h2 = { fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 };
const p = { marginBottom: 12 };
const ul = { marginBottom: 12, paddingLeft: 22 };

export default function PrivacyPolicyPage() {
  return (
    <div>
      <Header />
      <main style={wrap}>
        <h1 style={h1}>Chính sách quyền riêng tư</h1>
        <p style={meta}>Cập nhật lần cuối: {LAST_UPDATED}</p>

        <p style={p}>
          Chính sách này mô tả cách ứng dụng <strong>My Guitar</strong> ("chúng tôi")
          thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi sử dụng website và
          các dịch vụ liên quan. Bằng việc sử dụng dịch vụ, bạn đồng ý với các điều
          khoản trong chính sách này.
        </p>

        <h2 style={h2}>1. Thông tin chúng tôi thu thập</h2>
        <ul style={ul}>
          <li>
            <strong>Thông tin tài khoản:</strong> họ tên, địa chỉ email, ảnh đại diện
            khi bạn đăng ký hoặc đăng nhập (kể cả qua Google hoặc Facebook).
          </li>
          <li>
            <strong>Thông tin liên hệ &amp; giao hàng:</strong> số điện thoại, địa chỉ
            khi bạn đặt hàng.
          </li>
          <li>
            <strong>Nội dung bạn tạo:</strong> bài đăng diễn đàn, đánh giá, tệp âm thanh
            tải lên để luyện tập, và dữ liệu tiến độ học tập.
          </li>
          <li>
            <strong>Dữ liệu kỹ thuật:</strong> thông tin đăng nhập, nhật ký sử dụng cơ
            bản nhằm bảo mật và cải thiện dịch vụ.
          </li>
        </ul>

        <h2 style={h2}>2. Cách chúng tôi sử dụng thông tin</h2>
        <ul style={ul}>
          <li>Tạo và quản lý tài khoản, xác thực đăng nhập.</li>
          <li>Xử lý đơn hàng, thanh toán và giao hàng.</li>
          <li>Cung cấp tính năng luyện tập, phân tích hợp âm và gợi ý bằng AI.</li>
          <li>Liên hệ, gửi thông báo liên quan đến dịch vụ và hỗ trợ người dùng.</li>
          <li>Bảo mật, phòng chống gian lận và cải thiện trải nghiệm.</li>
        </ul>

        <h2 style={h2}>3. Đăng nhập qua Google &amp; Facebook</h2>
        <p style={p}>
          Khi bạn đăng nhập bằng Google hoặc Facebook, chúng tôi chỉ nhận các thông tin
          cơ bản mà bạn cho phép (tên, email, ảnh đại diện) để tạo tài khoản. Chúng tôi
          <strong> không</strong> thu thập mật khẩu mạng xã hội của bạn và không đăng bài
          thay bạn.
        </p>

        <h2 style={h2}>4. Chia sẻ thông tin</h2>
        <p style={p}>
          Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn. Thông tin chỉ
          được chia sẻ với các nhà cung cấp dịch vụ cần thiết để vận hành (ví dụ lưu trữ
          tệp trên Cloudinary, gửi email), và chỉ trong phạm vi cần thiết.
        </p>

        <h2 style={h2}>5. Lưu trữ &amp; bảo mật</h2>
        <p style={p}>
          Dữ liệu được lưu trên cơ sở dữ liệu được bảo vệ và truyền tải qua kết nối mã
          hóa HTTPS. Chúng tôi áp dụng các biện pháp hợp lý để bảo vệ dữ liệu, tuy nhiên
          không có hệ thống nào an toàn tuyệt đối.
        </p>

        <h2 style={h2}>6. Quyền của bạn &amp; Xóa dữ liệu</h2>
        <p style={p}>
          Bạn có quyền xem, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình. Để
          yêu cầu xóa toàn bộ dữ liệu liên quan đến tài khoản (bao gồm dữ liệu nhận từ
          Google/Facebook), vui lòng gửi email tới{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> với tiêu đề
          "Yêu cầu xóa dữ liệu". Chúng tôi sẽ xử lý trong vòng 30 ngày.
        </p>

        <h2 style={h2}>7. Trẻ em</h2>
        <p style={p}>
          Dịch vụ không hướng đến trẻ em dưới 13 tuổi. Chúng tôi không cố ý thu thập dữ
          liệu của trẻ em dưới 13 tuổi.
        </p>

        <h2 style={h2}>8. Thay đổi chính sách</h2>
        <p style={p}>
          Chúng tôi có thể cập nhật chính sách này theo thời gian. Mọi thay đổi sẽ được
          đăng tải trên trang này kèm ngày cập nhật.
        </p>

        <h2 style={h2}>9. Liên hệ</h2>
        <p style={p}>
          Nếu có câu hỏi về chính sách quyền riêng tư, vui lòng liên hệ:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
