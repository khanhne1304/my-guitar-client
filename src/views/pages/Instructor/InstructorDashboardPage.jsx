import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import InstructorOnly from './InstructorOnly';
import { getMyCoursesApi } from '../../../services/instructorCourseService';
import styles from '../LearningPathPage/LearningPathPage.module.css';
import cs from '../CourseLearning/CourseLearning.module.css';

export default function InstructorDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let c = true;
    (async () => {
      try {
        const list = await getMyCoursesApi();
        if (c) setCourses(list);
      } catch (e) {
        if (c) setErr(e.message || 'Không tải được');
      } finally {
        if (c) setLoading(false);
      }
    })();
    return () => {
      c = false;
    };
  }, []);

  return (
    <InstructorOnly>
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <h1 className={styles.title} style={{ margin: 0 }}>
                Khóa học của tôi
              </h1>
              <Link className={styles.btnPrimary} to="/instructor/course/new">
                + Tạo khóa mới
              </Link>
            </div>
            <p className={styles.lead}>
              Khóa mới ở trạng thái nháp. Khi đủ học phần, bài học và bài kiểm tra (≥3 câu) cho mỗi học phần có bài — bạn có thể
              xuất bản để mọi người thấy trong lộ trình học.
            </p>
            {err && <div className={styles.error}>{err}</div>}
            {loading ? (
              <p className={styles.muted}>Đang tải…</p>
            ) : !courses.length ? (
              <p className={styles.muted}>Chưa có khóa nào. Hãy tạo khóa đầu tiên.</p>
            ) : (
              <ul className={styles.lessonList}>
                {courses.map((c) => (
                  <li key={c.id} className={styles.lessonRow}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      <div className={styles.lessonMeta}>
                        {c.isPublished ? <span className={styles.badgeDone}>Đã xuất bản</span> : <span className={styles.badge}>Nháp</span>}
                        {' · '}
                        {c.level === 'intermediate' ? 'Trung cấp' : c.level === 'advanced' ? 'Nâng cao' : 'Cơ bản'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link className={styles.linkBtn} to={`/instructor/course/${c.id}/edit`}>
                        Chỉnh sửa
                      </Link>
                      <a className={cs.linkBtn} href={`/learning/course/${c.id}`} target="_blank" rel="noreferrer">
                        Xem trước
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p style={{ marginTop: 20, fontSize: 13, color: '#7a7165' }}>
              Bạn có thể tạo khóa chia sẻ với cộng đồng; sau khi xuất bản, khóa hiển thị trong lộ trình học để mọi người tham gia và trao đổi.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </InstructorOnly>
  );
}
