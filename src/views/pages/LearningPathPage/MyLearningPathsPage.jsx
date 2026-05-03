import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import {
  listCustomPathsApi,
  deleteCustomPathApi,
} from '../../../services/userLearningPathService';
import styles from './LearningPathPage.module.css';
import ps from './UserLearningPath.module.css';

export default function MyLearningPathsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, authChecked } = useAuth();
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setErr('');
    try {
      const list = await listCustomPathsApi();
      setPaths(list);
    } catch (e) {
      setErr(e.message || 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      navigate('/login?redirect=/learning/paths', { replace: true });
      return;
    }
    load();
  }, [authChecked, isAuthenticated, navigate]);

  const onDelete = async (id, title) => {
    if (!window.confirm(`Xóa lộ trình "${title}"? Hành động không hoàn tác.`)) return;
    setErr('');
    try {
      await deleteCustomPathApi(id);
      setPaths((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setErr(e.message || 'Không xóa được');
    }
  };

  if (!authChecked || loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <p className={styles.muted}>Đang tải…</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={ps.toolbar}>
            <div>
              <h1 className={styles.title} style={{ margin: 0 }}>
                Lộ trình tự tạo
              </h1>
              <p className={styles.lead} style={{ margin: '8px 0 0' }}>
                Ghi lại các bước luyện tập hoặc mục tiêu theo tuần — chỉ bạn xem và chỉnh sửa.
              </p>
            </div>
            <Link className={styles.btnPrimary} to="/learning/paths/new">
              + Tạo lộ trình
            </Link>
          </div>

          <p style={{ marginBottom: 16 }}>
            <Link className={styles.linkBtn} to="/learning/course">
              ← Về lộ trình khóa học (khóa trên hệ thống)
            </Link>
          </p>

          {err && <div className={styles.error}>{err}</div>}

          {!paths.length ? (
            <p className={styles.muted}>Chưa có lộ trình nào. Bấm &quot;Tạo lộ trình&quot; để bắt đầu.</p>
          ) : (
            <ul className={ps.pathList}>
              {paths.map((p) => (
                <li key={p.id} className={ps.pathRow}>
                  <div className={ps.pathMeta}>
                    <div className={ps.pathTitle}>{p.title}</div>
                    {p.description ? <p className={ps.pathDesc}>{p.description}</p> : null}
                    <p className={styles.muted} style={{ textAlign: 'left', marginTop: 8, fontSize: 13 }}>
                      {(p.steps?.length || 0) || 0} bước
                      {p.updatedAt ? ` · Cập nhật ${new Date(p.updatedAt).toLocaleDateString('vi-VN')}` : ''}
                    </p>
                  </div>
                  <div className={ps.pathActions}>
                    <Link className={styles.linkBtn} to={`/learning/paths/edit/${p.id}`}>
                      Chỉnh sửa
                    </Link>
                    <button type="button" className={ps.dangerBtn} onClick={() => onDelete(p.id, p.title)}>
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
