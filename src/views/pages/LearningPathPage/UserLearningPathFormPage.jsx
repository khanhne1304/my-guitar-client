import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import {
  getCustomPathApi,
  createCustomPathApi,
  updateCustomPathApi,
  deleteCustomPathApi,
} from '../../../services/userLearningPathService';
import styles from './LearningPathPage.module.css';
import ps from './UserLearningPath.module.css';

function emptyStep() {
  return { title: '', note: '' };
}

export default function UserLearningPathFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathId } = useParams();
  const { isAuthenticated, authChecked } = useAuth();

  const isNew = location.pathname.endsWith('/new');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([emptyStep()]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }
    if (isNew) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setErr('');
      try {
        const data = await getCustomPathApi(pathId);
        if (cancelled) return;
        setTitle(data.title || '');
        setDescription(data.description || '');
        const s = Array.isArray(data.steps) && data.steps.length ? data.steps : [emptyStep()];
        setSteps(
          s.map((x) => ({
            title: x.title || '',
            note: x.note || '',
          })),
        );
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Không tải được lộ trình');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authChecked, isAuthenticated, isNew, pathId, navigate, location.pathname]);

  const moveStep = (index, dir) => {
    setSteps((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const addStep = () => setSteps((prev) => [...prev, emptyStep()]);
  const removeStep = (index) =>
    setSteps((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

  const setStepField = (index, field, value) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const payloadFromForm = () => {
    const stepPayload = steps
      .map((s) => ({
        title: (s.title || '').trim(),
        note: (s.note || '').trim(),
      }))
      .filter((s) => s.title.length > 0);
    return {
      title: title.trim(),
      description: description.trim(),
      steps: stepPayload,
    };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    const body = payloadFromForm();
    if (!body.title) {
      setErr('Nhập tiêu đề lộ trình.');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await createCustomPathApi(body);
      } else {
        await updateCustomPathApi(pathId, body);
      }
      navigate('/learning/paths', { replace: true });
    } catch (ex) {
      setErr(ex.message || 'Không lưu được');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (isNew) return;
    if (!window.confirm('Xóa hẳn lộ trình này?')) return;
    setErr('');
    try {
      await deleteCustomPathApi(pathId);
      navigate('/learning/paths', { replace: true });
    } catch (ex) {
      setErr(ex.message || 'Không xóa được');
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
          <p style={{ marginBottom: 16 }}>
            <Link className={styles.linkBtn} to="/learning/paths">
              ← Danh sách lộ trình
            </Link>
          </p>

          <h1 className={styles.title}>{isNew ? 'Tạo lộ trình' : 'Chỉnh sửa lộ trình'}</h1>
          <p className={styles.lead}>
            Thêm các bước nhỏ (ví dụ: tuần 1 — hợp âm Am; tuần 2 — chuyển Am–Em). Ghi chú là tùy chọn.
          </p>

          {err && <div className={styles.error}>{err}</div>}

          <form onSubmit={onSubmit}>
            <div className={ps.field}>
              <label htmlFor="ulp-title">Tiêu đề *</label>
              <input
                id="ulp-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: 4 tuần làm quen fingerstyle"
                maxLength={160}
                autoComplete="off"
              />
            </div>
            <div className={ps.field}>
              <label htmlFor="ulp-desc">Mô tả (tùy chọn)</label>
              <textarea
                id="ulp-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mục tiêu tổng quát hoặc ghi chú cho bản thân"
                maxLength={3000}
              />
            </div>

            <h2 className={styles.h2}>Các bước</h2>
            <ul className={ps.stepList}>
              {steps.map((step, index) => (
                <li key={index} className={ps.stepCard}>
                  <div className={ps.stepHead}>
                    <span className={ps.stepNum}>Bước {index + 1}</span>
                    <div className={ps.stepBtns}>
                      <button
                        type="button"
                        className={ps.iconBtn}
                        disabled={index === 0}
                        onClick={() => moveStep(index, -1)}
                        aria-label="Lên"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={ps.iconBtn}
                        disabled={index === steps.length - 1}
                        onClick={() => moveStep(index, 1)}
                        aria-label="Xuống"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={ps.iconBtn}
                        disabled={steps.length <= 1}
                        onClick={() => removeStep(index)}
                      >
                        Xóa bước
                      </button>
                    </div>
                  </div>
                  <div className={ps.stepBody}>
                    <div className={ps.field} style={{ marginBottom: 8 }}>
                      <label htmlFor={`st-${index}-t`}>Tên bước</label>
                      <input
                        id={`st-${index}-t`}
                        value={step.title}
                        onChange={(e) => setStepField(index, 'title', e.target.value)}
                        placeholder="Ví dụ: Nắm pattern arpeggio cơ bản"
                        maxLength={200}
                      />
                    </div>
                    <div className={ps.field} style={{ marginBottom: 0 }}>
                      <label htmlFor={`st-${index}-n`}>Ghi chú</label>
                      <textarea
                        id={`st-${index}-n`}
                        value={step.note}
                        onChange={(e) => setStepField(index, 'note', e.target.value)}
                        placeholder="Chi tiết, link tham khảo…"
                        maxLength={1000}
                        rows={2}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <button type="button" className={styles.linkBtn} style={{ marginTop: 8 }} onClick={addStep}>
              + Thêm bước
            </button>

            <div className={ps.rowActions}>
              <button type="submit" className={styles.btnPrimary} disabled={saving}>
                {saving ? 'Đang lưu…' : 'Lưu'}
              </button>
              <Link className={styles.btnGhost} style={{ textDecoration: 'none', display: 'inline-block' }} to="/learning/paths">
                Hủy
              </Link>
              {!isNew ? (
                <button type="button" className={ps.dangerBtn} onClick={onDelete}>
                  Xóa lộ trình
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
