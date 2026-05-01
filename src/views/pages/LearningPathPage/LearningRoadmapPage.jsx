import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/homeItem/Header/Header';
import Footer from '../../components/homeItem/Footer/Footer';
import { useAuth } from '../../../context/AuthContext';
import { getLearningRoadmapApi } from '../../../services/learningService';
import { needsGuitarOnboarding, LEVEL_LABELS, GOAL_OPTIONS } from '../../../utils/learningOnboarding';
import { getUser, setUser, mergeUser } from '../../../utils/storage';
import { updateUserProfileApi } from '../../../services/userService';
import styles from './LearningPathPage.module.css';

function lastNDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function startOfWeekMonday(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay(); // 0: CN, 1: T2...
  const diff = day === 0 ? -6 : 1 - day; // lùi về Thứ 2
  d.setDate(d.getDate() + diff);
  return d;
}

function currentWeekYMDs() {
  const monday = startOfWeekMonday(new Date());
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function weekdayShortViFromYMD(ymd) {
  const d = new Date(`${ymd}T12:00:00`);
  const w = d.getDay(); // 0: CN, 1: T2 ...
  switch (w) {
    case 1:
      return 'Thứ 2';
    case 2:
      return 'Thứ 3';
    case 3:
      return 'Thứ 4';
    case 4:
      return 'Thứ 5';
    case 5:
      return 'Thứ 6';
    case 6:
      return 'Thứ 7';
    default:
      return 'Chủ nhật';
  }
}

export default function LearningRoadmapPage() {
  const navigate = useNavigate();
  const { isAuthenticated, authChecked, login: authLogin } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [resettingOnboarding, setResettingOnboarding] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [goalDraft, setGoalDraft] = useState([]);
  const [savingGoals, setSavingGoals] = useState(false);

  const load = async () => {
    setErr('');
    try {
      const data = await getLearningRoadmapApi();
      setRoadmap(data);
    } catch (e) {
      if (e.status === 403 && e.data?.code === 'ONBOARDING_REQUIRED') {
        navigate('/learning/onboarding', { replace: true });
        return;
      }
      setErr(e.message || 'Không tải được lộ trình');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      navigate('/login?redirect=/learning/roadmap', { replace: true });
      return;
    }
    load();
  }, [authChecked, isAuthenticated, navigate]);

  const goRedoOnboarding = async () => {
    setResettingOnboarding(true);
    try {
      const updated = await updateUserProfileApi({ guitarOnboardingCompleted: false });
      const prev = getUser();
      const merged = mergeUser(updated, prev);
      setUser(merged);
      authLogin(merged);
      navigate('/learning/onboarding', { replace: true });
    } catch (e) {
      setErr(e.message || 'Không thể mở lại bài đánh giá');
    } finally {
      setResettingOnboarding(false);
    }
  };

  const openGoalPicker = () => {
    const current = Array.isArray(roadmap?.goals) ? roadmap.goals : [];
    setGoalDraft(current);
    setShowGoalPicker(true);
  };

  const toggleGoal = (id) => {
    setGoalDraft((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  };

  const saveGoals = async () => {
    setErr('');
    if (!goalDraft.length) {
      setErr('Chọn ít nhất một mục tiêu học.');
      return;
    }
    setSavingGoals(true);
    try {
      const updated = await updateUserProfileApi({
        guitarGoals: goalDraft,
        guitarOnboardingCompleted: true,
      });
      const prev = getUser();
      const merged = mergeUser(updated, prev);
      setUser(merged);
      authLogin(merged);
      setShowGoalPicker(false);
      await load();
    } catch (e) {
      setErr(e.message || 'Không thể cập nhật mục tiêu');
    } finally {
      setSavingGoals(false);
    }
  };

  const stats = roadmap?.stats;
  const days = currentWeekYMDs(); // luôn Thứ 2 → Chủ nhật (tuần hiện tại)
  const byDay = Object.fromEntries((stats?.dailyPractice || []).map((d) => [d.day, d.minutes]));
  const maxMin = Math.max(1, ...days.map((d) => byDay[d] || 0));

  const streakAtRisk =
    stats?.currentStreak > 0 &&
    stats?.lastStudyDate &&
    stats.lastStudyDate !== new Date().toISOString().slice(0, 10);

  const goalLabel = (id) => GOAL_OPTIONS.find((g) => g.id === id)?.label || id;

  // Tuỳ chỉnh ngôi sao (rộng/cao) tại đây
  const STAR_VARS = {
    // Lưu ý: kích thước thực tế ≈ --star-size * --star-scale-y
    // Giữ scale 4 nhưng giảm size để không tràn lên phần stats phía trên.
    '--star-size': '20px',
    '--star-scale-x': 4, // chiều rộng (1 = chuẩn)
    '--star-scale-y': 4, // chiều cao (1 = chuẩn)
    '--star-top': '0px', // đẩy lên/xuống (dương = xuống)
    // khoảng trống dành cho ngôi sao (để label nằm xuống dưới ngôi sao)
    '--star-space': '96px',
  };

  if (!authChecked || loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <p className={styles.muted}>Đang tải lộ trình…</p>
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
          <div className={styles.topBar}>
            <div>
              <h1 className={styles.title}>Lộ trình học của bạn</h1>
              <p className={styles.lead}>
                Trình độ: <strong>{LEVEL_LABELS[roadmap?.level] || '—'}</strong>
                {roadmap?.goals?.length ? (
                  <>
                    {' '}
                    · Mục tiêu: {roadmap.goals.map(goalLabel).join(', ')}
                  </>
                ) : null}
              </p>
            </div>
            <div className={styles.topActions}>
              <button
                type="button"
                className={styles.btnGhost}
                disabled={resettingOnboarding}
                onClick={goRedoOnboarding}
              >
                {resettingOnboarding ? 'Đang mở…' : 'Làm lại đánh giá'}
              </button>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={openGoalPicker}
              >
                Chọn lại mục tiêu học
              </button>
            </div>
          </div>

          {showGoalPicker && (
            <div className={styles.goalPanel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h3 className={styles.recapTitle} style={{ marginBottom: 6 }}>
                    Chọn mục tiêu học
                  </h3>
                  <p className={styles.hint} style={{ margin: 0 }}>
                    Lộ trình sẽ lọc nội dung theo mục tiêu bạn chọn.
                  </p>
                </div>
                <button type="button" className={styles.btnGhost} onClick={() => setShowGoalPicker(false)}>
                  Đóng
                </button>
              </div>

              <div className={styles.goalGrid}>
                {GOAL_OPTIONS.map((g) => (
                  <label
                    key={g.id}
                    className={`${styles.goalOption} ${goalDraft.includes(g.id) ? styles.goalOptionActive : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={goalDraft.includes(g.id)}
                      onChange={() => toggleGoal(g.id)}
                    />
                    <span>{g.label}</span>
                  </label>
                ))}
              </div>

              <div className={styles.actions}>
                <button type="button" className={styles.btnGhost} onClick={() => setShowGoalPicker(false)}>
                  Hủy
                </button>
                <button type="button" className={styles.btnPrimary} disabled={savingGoals} onClick={saveGoals}>
                  {savingGoals ? 'Đang lưu…' : 'Lưu mục tiêu'}
                </button>
              </div>
            </div>
          )}

          {streakAtRisk && (
            <p className={styles.hint} style={{ color: '#8b6914' }}>
              Bạn đang có chuỗi {stats.currentStreak} ngày — học hôm nay để giữ streak.
            </p>
          )}

          {err && <div className={styles.error}>{err}</div>}

          {stats && (
            <>
              <div className={styles.progressBarWrap}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${stats.coursePercent}%` }}
                />
              </div>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stats.coursePercent}%</div>
                  <div className={styles.statLabel}>Hoàn thành lộ trình</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {stats.lessonsCompleted}/{stats.lessonsTotal}
                  </div>
                  <div className={styles.statLabel}>Bài đã học</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stats.totalPracticeMinutes}</div>
                  <div className={styles.statLabel}>Phút luyện tập</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stats.todayVideoWatchMinutes ?? 0}</div>
                  <div className={styles.statLabel}>Phút xem video hôm nay</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stats.currentStreak}</div>
                  <div className={styles.statLabel}>Streak (ngày)</div>
                </div>
              </div>

              <h2 className={styles.h2}>Chuỗi ngày học tập</h2>
              <div className={styles.chartRow} style={STAR_VARS}>
                {days.map((day) => {
                  const m = byDay[day] || 0;
                  const h = Math.round((m / maxMin) * 88);
                  const missed = m <= 0;
                  return (
                    <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div
                        className={`${styles.chartBar} ${missed ? styles.chartBarMuted : ''}`}
                        style={{ height: `${Math.max(4, h)}px`, alignSelf: 'stretch' }}
                        title={`${m} phút`}
                      />
                      <div className={styles.dayLabelWrap}>
                        {m > 0 && <div className={styles.dayStar}>★</div>}
                        <div className={`${styles.chartLabel} ${missed ? styles.chartLabelMuted : ''}`}>
                          {weekdayShortViFromYMD(day)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </>
          )}

          <h2 className={styles.h2}>Module & bài học</h2>
          {(roadmap?.modules || []).map((mod) => (
            <div key={mod.id} className={styles.module}>
              <div className={styles.moduleHead}>
                <h3 className={styles.moduleTitle}>{mod.title}</h3>
                {mod.description && <p className={styles.moduleDesc}>{mod.description}</p>}
                <div className={styles.progressBarWrap} style={{ marginTop: 10 }}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${mod.progressPercent}%` }}
                  />
                </div>
              </div>
              <ul className={styles.lessonList}>
                {mod.lessons.map((les) => (
                  <li
                    key={les.id}
                    className={`${styles.lessonRow} ${les.locked ? styles.lessonLocked : ''}`}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#2c2416' }}>{les.title}</div>
                      <div className={styles.lessonMeta}>
                        {les.type === 'video' && 'Video'}
                        {les.type === 'exercise' && 'Bài tập'}
                        {les.type === 'quiz' && 'Kiểm tra'}
                        {les.estimatedMinutes ? ` · ~${les.estimatedMinutes} phút` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {les.unlockProgress && (
                        <span className={styles.badge}>
                          {les.unlockProgress.current}/{les.unlockProgress.total}
                        </span>
                      )}
                      {les.completed ? (
                        <span className={`${styles.badge} ${styles.badgeDone}`}>Đã xong</span>
                      ) : les.locked ? (
                        <span className={styles.badge}>Khóa</span>
                      ) : null}
                      {les.locked ? (
                        <span className={`${styles.linkBtn} ${styles.linkBtnMuted}`}>Vào bài</span>
                      ) : (
                        <Link to={`/learning/lesson/${les.id}`} className={styles.linkBtn}>
                          Vào bài
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
