import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import InstructorOnly from './InstructorOnly';
import { createCourseApi } from '../../../services/instructorCourseService';
import styles from '../LearningPathPage/LearningPathPage.module.css';

const LEVELS = [
  { id: 'beginner', label: 'Cơ bản' },
  { id: 'intermediate', label: 'Trung cấp' },
  { id: 'advanced', label: 'Nâng cao' },
];

export default function InstructorCourseCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('beginner');
  const [tags, setTags] = useState('');
  const [thumb, setThumb] = useState('');
  const [price, setPrice] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const course = await createCourseApi({
        title,
        description,
        level,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        thumbnail: thumb || undefined,
        price: price === '' ? undefined : Number(price),
      });
      const cid = course._id || course.id;
      navigate(`/instructor/course/${cid}/edit`, { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Không tạo được khóa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <InstructorOnly>
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <Link to="/instructor" className={styles.linkBtn}>
              ← Bảng điều khiển
            </Link>
            <h1 className={styles.title}>Tạo khóa học mới</h1>
            {err && <div className={styles.error}>{err}</div>}
            <form onSubmit={submit}>
              <p style={{ marginBottom: 8, fontWeight: 600 }}>Tiêu đề *</p>
              <input
                className={styles.option}
                style={{ width: '100%', maxWidth: 480 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={2}
              />
              <p style={{ margin: '16px 0 8px', fontWeight: 600 }}>Mô tả</p>
              <textarea
                className={styles.option}
                style={{ width: '100%', minHeight: 100, maxWidth: 560 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p style={{ margin: '16px 0 8px', fontWeight: 600 }}>Trình độ</p>
              <select className={styles.option} value={level} onChange={(e) => setLevel(e.target.value)}>
                {LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
              <p style={{ margin: '16px 0 8px', fontWeight: 600 }}>Tags (phân tách bằng dấu phẩy)</p>
              <input
                className={styles.option}
                style={{ width: '100%', maxWidth: 480 }}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="fingerstyle, acoustic"
              />
              <p style={{ margin: '16px 0 8px', fontWeight: 600 }}>Ảnh bìa (URL)</p>
              <input
                className={styles.option}
                style={{ width: '100%', maxWidth: 480 }}
                value={thumb}
                onChange={(e) => setThumb(e.target.value)}
              />
              <p style={{ margin: '16px 0 8px', fontWeight: 600 }}>Giá (để trống = miễn phí)</p>
              <input
                type="number"
                min={0}
                className={styles.option}
                style={{ width: 200 }}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <div className={styles.actions} style={{ marginTop: 24 }}>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Đang tạo…' : 'Tạo và vào trình biên tập'}
                </button>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </InstructorOnly>
  );
}
