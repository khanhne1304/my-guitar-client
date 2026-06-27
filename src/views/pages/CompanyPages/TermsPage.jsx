import PolicyLayout, { styles as s, CONTACT_EMAIL } from "../PolicyPages/PolicyLayout";

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Điều khoản sử dụng website"
      intro="Khi truy cập và sử dụng website GuitarMaster, bạn đồng ý với các điều khoản dưới đây."
    >
      <h2 style={s.h2}>1. Chấp nhận điều khoản</h2>
      <p style={s.p}>
        Việc bạn sử dụng website đồng nghĩa với việc bạn đã đọc, hiểu và đồng ý tuân thủ các
        điều khoản này cùng các chính sách liên quan.
      </p>

      <h2 style={s.h2}>2. Tài khoản người dùng</h2>
      <ul style={s.ul}>
        <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
        <li>Không sử dụng tài khoản của người khác khi chưa được phép.</li>
        <li>Thông tin cung cấp phải chính xác và cập nhật.</li>
      </ul>

      <h2 style={s.h2}>3. Quyền sở hữu trí tuệ</h2>
      <p style={s.p}>
        Toàn bộ nội dung trên website (logo, hình ảnh, văn bản, bài học, mã nguồn) thuộc quyền
        sở hữu của GuitarMaster hoặc đối tác. Nghiêm cấm sao chép, phân phối khi chưa được phép.
      </p>

      <h2 style={s.h2}>4. Hành vi bị cấm</h2>
      <ul style={s.ul}>
        <li>Đăng tải nội dung vi phạm pháp luật, xúc phạm, spam.</li>
        <li>Can thiệp, phá hoại hệ thống hoặc truy cập trái phép.</li>
        <li>Sử dụng dịch vụ cho mục đích gian lận.</li>
      </ul>

      <h2 style={s.h2}>5. Giới hạn trách nhiệm</h2>
      <p style={s.p}>
        GuitarMaster nỗ lực đảm bảo thông tin chính xác nhưng không chịu trách nhiệm cho các
        thiệt hại phát sinh ngoài ý muốn do việc sử dụng website.
      </p>

      <h2 style={s.h2}>6. Thay đổi điều khoản</h2>
      <p style={s.p}>
        Chúng tôi có thể cập nhật điều khoản theo thời gian. Mọi thay đổi sẽ được đăng tải trên
        trang này. Liên hệ <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> nếu có thắc mắc.
      </p>
    </PolicyLayout>
  );
}
