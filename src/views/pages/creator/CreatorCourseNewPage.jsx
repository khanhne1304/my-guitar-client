import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import CreatorOnly from './CreatorOnly';
import { createCourseApi } from '../../../services/learningApi';
import page from '../courses/LearningLayout.module.css';

const LEVELS = [
  { id: 'beginner', label: 'Cơ bản' },
  { id: 'intermediate', label: 'Trung cấp' },
  { id: 'advanced', label: 'Nâng cao' },
];

export default function CreatorCourseNewPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [level, setLevel] = useState('beginner');
  const [tags, setTags] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const res = await createCourseApi({
        title,
        description,
        thumbnail: thumbnail || undefined,
        level,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      const id = res.course?.id || res.id;
      navigate(`/creator/course/${id}/edit`, { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Không tạo được khóa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CreatorOnly>
      <div className={page.page}>
        <Header />
        <main className={page.main}>
          <div className={page.card}>
            <Link to="/creator" className={page.linkBtn}>
              ← Bảng điều khiển
            </Link>
            <h1 className={page.title}>Tạo khóa học mới</h1>
            {err && <div className={page.error}>{err}</div>}
            <form onSubmit={submit}>
              <p style={{ marginBottom: 8, fontWeight: 600 }}>Tiêu đề *</p>
              <input
                className={page.option}
                style={{ width: '100%', marginBottom: 12 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <p style={{ marginBottom: 8, fontWeight: 600 }}>Mô tả</p>
              <textarea
                className={page.option}
                style={{ width: '100%', minHeight: 100, marginBottom: 12 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p style={{ marginBottom: 8, fontWeight: 600 }}>Ảnh bìa (URL)</p>
              <input
                className={page.option}
                style={{ width: '100%', marginBottom: 12 }}
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
              <p style={{ marginBottom: 8, fontWeight: 600 }}>Cấp độ</p>
              <select
                className={page.option}
                style={{ width: '100%', marginBottom: 12 }}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
              <p style={{ marginBottom: 8, fontWeight: 600 }}>Tags (phân cách bằng dấu phẩy)</p>
              <input
                className={page.option}
                style={{ width: '100%', marginBottom: 16 }}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <button type="submit" className={page.btnPrimary} disabled={saving}>
                {saving ? 'Đang tạo…' : 'Tạo và chỉnh sửa'}
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </CreatorOnly>
  );
}
