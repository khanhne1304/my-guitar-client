import PolicyLayout, { styles as s, CONTACT_EMAIL } from "../PolicyPages/PolicyLayout";

const JOBS = [
  {
    title: "Nhân viên tư vấn bán hàng (Sales)",
    place: "TP.HCM / Hà Nội",
    type: "Toàn thời gian",
  },
  {
    title: "Kỹ thuật viên bảo hành nhạc cụ",
    place: "TP. Thủ Đức",
    type: "Toàn thời gian",
  },
  {
    title: "Lập trình viên Web (MERN)",
    place: "TP.HCM / Remote",
    type: "Toàn thời gian",
  },
  {
    title: "Cộng tác viên nội dung âm nhạc",
    place: "Remote",
    type: "Bán thời gian",
  },
];

const jobCard = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "14px 18px",
  marginBottom: 12,
  background: "#fff",
};

export default function CareersPage() {
  return (
    <PolicyLayout
      title="Tuyển dụng"
      intro="Gia nhập đội ngũ GuitarMaster - nơi bạn được làm việc cùng âm nhạc và công nghệ."
    >
      <h2 style={s.h2}>Vị trí đang tuyển</h2>
      {JOBS.map((job) => (
        <div key={job.title} style={jobCard}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{job.title}</div>
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            📍 {job.place} · 🕒 {job.type}
          </div>
        </div>
      ))}

      <h2 style={s.h2}>Quyền lợi</h2>
      <ul style={s.ul}>
        <li>Lương thưởng cạnh tranh, xét tăng lương định kỳ.</li>
        <li>Môi trường trẻ trung, năng động, yêu âm nhạc.</li>
        <li>Ưu đãi khi mua nhạc cụ và tham gia khóa học nội bộ.</li>
      </ul>

      <h2 style={s.h2}>Cách ứng tuyển</h2>
      <p style={s.p}>
        Gửi CV về email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> với tiêu đề
        "Ứng tuyển - [Vị trí]". Chúng tôi sẽ liên hệ với các ứng viên phù hợp.
      </p>
    </PolicyLayout>
  );
}
