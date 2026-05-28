import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../../components/homeItem/Header/Header";
import Footer from "../../../components/homeItem/Footer/Footer";
import useRhythmPracticeVM from "../../../../viewmodels/RhythmPracticeViewModel";
import { toneChords } from "../../../../data/toneChords";
import { usePractice } from "../../../../context/PracticeContext";
import { useAuth } from "../../../../context/AuthContext";
import styles from "./ChordPracticeDetailPage.module.css";

export default function RhythmPracticePage() {
  const vm = useRhythmPracticeVM();
  const { getProgressStats } = usePractice();
  const { isAuthenticated: authIsAuthenticated, authChecked, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const bpmFromUrl = Number(searchParams.get('bpm'));
    if (bpmFromUrl >= 30 && bpmFromUrl <= 300) {
      vm.setBpm(bpmFromUrl);
    }
  }, [searchParams, vm.setBpm]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (authChecked && !authIsAuthenticated) {
      navigate('/login');
    }
  }, [authChecked, authIsAuthenticated, navigate]);

  const stats = getProgressStats(3);

  if (!authChecked || !authIsAuthenticated) {
    return (
      <>
        <Header />
        <main className={styles.detailPage}>
          <div className={styles.container}>
            <div className={styles.loadingMessage}>
              <h2>Đang kiểm tra đăng nhập...</h2>
              <p>Vui lòng đăng nhập để sử dụng tính năng luyện tập</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <div>
      <Header />

      <main className={styles.detailPage}>
        <div className={styles.container}>
          <button onClick={() => navigate('/tools/chord-practice')} className={styles.backButton}>← Quay lại</button>

          <div className={styles.header}>
            <h1 className={styles.title}>Luyện tập theo nhịp</h1>
            <p className={styles.description}>Chơi hợp âm theo nhịp điệu</p>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressCard}>
              <h3>Tiến độ hiện tại</h3>
               <div className={styles.progressStats}>
                 <div className={styles.statItem}>
                   <span className={styles.statNumber}>{vm.completedTones}</span>
                   <span className={styles.statLabel}>Đã hoàn thành</span>
                 </div>
                 <div className={styles.statItem}>
                   <span className={styles.statNumber}>{vm.totalTones}</span>
                   <span className={styles.statLabel}>Tổng số</span>
                 </div>
                 <div className={styles.statItem}>
                   <span className={styles.statNumber}>{vm.completedPercent}%</span>
                   <span className={styles.statLabel}>Hoàn thành</span>
                 </div>
               </div>
            </div>
          </div>

          <div className={styles.content}>
            <h2 style={{ marginTop: 0, marginBottom: 12 }}>Thiết lập & luyện tập</h2>
            {vm.passNotice && (
              <div className={styles.progressCard} style={{ marginBottom: 12, background: '#d1fae5', borderColor: '#10b981' }}>
                <h3 style={{ marginTop: 0 }}>🎉 Chúc mừng!</h3>
                <p style={{ margin: 0 }}>
                  Bạn đã vượt qua tiến trình {vm.passNotice.progression} trong {vm.passNotice.tone}
                  với độ chính xác {vm.passNotice.accuracy}%.
                </p>
                <div style={{ marginTop: 8 }}>
                  <button className={styles.practiceBtn} onClick={vm.acknowledgePass}>Đóng</button>
                </div>
              </div>
            )}
            {/* Config panel */}
            <section className={styles.formGrid}>
              <label className={styles.formLabel}>
                BPM
                <input
                  className={styles.field}
                  type="number"
                  min={40}
                  max={240}
                  value={vm.bpm}
                  onChange={(e) => vm.setBpm(Math.max(40, Math.min(240, Number(e.target.value) || 0)))}
                  disabled={vm.isRunning}
                />
              </label>
              <label className={styles.formLabel}>
                Nhịp (phách/ô nhịp)
                <select className={styles.field} value={vm.timeSig} onChange={(e) => vm.setTimeSig(Number(e.target.value))} disabled={vm.isRunning}>
                  <option value={4}>4/4</option>
                  <option value={3}>3/4</option>
                  <option value={6}>6/8 (dùng 6 beats)</option>
                </select>
              </label>

              <label className={styles.formLabel}>
                Tone
                <select className={styles.field} value={vm.selectedTone} onChange={(e) => vm.setSelectedTone(e.target.value)} disabled={vm.isRunning}>
                  {Object.keys(toneChords).map((tone) => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </label>
              <label className={styles.formLabel}>
                Tiến trình hợp âm
                {(() => {
                  const toneProg = vm.getToneProgress(vm.selectedTone);
                  const isCurrentDone = (toneProg?.[vm.progressionPreset] || 0) >= vm.COMPLETION_THRESHOLD;
                  return (
                    <select
                      className={styles.field}
                      value={vm.progressionPreset}
                      onChange={(e) => vm.setProgressionPreset(e.target.value)}
                      disabled={vm.isRunning}
                      style={isCurrentDone ? { borderColor: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' } : undefined}
                    >
                      {vm.PROGRESSION_PRESETS.map((p) => {
                        const acc = toneProg?.[p] || 0;
                        const done = acc >= vm.COMPLETION_THRESHOLD;
                        return (
                          <option key={p} value={p} style={done ? { backgroundColor: '#d1fae5' } : undefined}>
                            {p} {done ? '✔' : ''}
                          </option>
                        );
                      })}
                    </select>
                  );
                })()}
              </label>


              <div className={styles.formLabel} style={{ gridColumn: "1 / -1" }}>
                Phát tiếng gõ nhịp
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" checked={vm.clickEnabled} onChange={(e) => vm.setClickEnabled(e.target.checked)} />
                    Bật gõ nhịp
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Âm lượng
                    <input className={styles.field} type="range" min={0} max={1} step={0.01} value={vm.clickVolume} onChange={(e) => vm.setClickVolume(Number(e.target.value))} style={{ width: 200 }} />
                  </label>
                </div>
              </div>
            </section>

            {/* Controls */}
            <section className={styles.controls}>
              {!vm.isRunning ? (
                <button onClick={vm.start} className={styles.practiceBtn}>Bắt đầu</button>
              ) : (
                <button onClick={vm.stop} className={styles.practiceBtn}>Dừng</button>
              )}
            </section>

            {vm.isCountingDown && (
              <div className={styles.loadingMessage} style={{ marginTop: 8 }}>
                Bắt đầu sau {Math.max(0, Math.ceil(vm.countdownMsLeft / 1000))} giây...
              </div>
            )}

            {/* HUD */}
            <section className={styles.hudGrid}>
              <div className={styles.hudItem}>
                <div className={styles.hudItemTitle}>Hợp âm hiện tại</div>
                <div className={styles.hudItemValue}>{vm.currentChord || "—"}</div>
              </div>
              <div className={styles.hudItem}>
                <div className={styles.hudItemTitle}>Tiếp theo</div>
                <div className={styles.hudItemValue}>{vm.nextChord || "—"}</div>
              </div>
              <div className={styles.hudItem}>
                <div className={styles.hudItemTitle}>Phách</div>
                <div className={styles.hudItemValue}>{vm.currentBeatIndex + 1} / {vm.timeSig}</div>
              </div>
            </section>

            {/* Score */}
            <section className={`${styles.progressStats} ${styles.progressStats5}`} style={{ marginTop: 16 }}>
              <div className={`${styles.statItem} ${styles.statItemCompact}`}>
                <span className={`${styles.statNumber} ${styles.statNumberCompact}`}>{vm.hitsTotal}</span>
                <span className={`${styles.statLabel} ${styles.statLabelCompact}`}>Tổng số hợp âm cần đánh</span>
              </div>
              <div className={`${styles.statItem} ${styles.statItemCompact}`}>
                <span className={`${styles.statNumber} ${styles.statNumberCompact}`}>{vm.attempts}</span>
                <span className={`${styles.statLabel} ${styles.statLabelCompact}`}>Tổng số hợp âm đã đánh</span>
              </div>
              <div className={`${styles.statItem} ${styles.statItemCompact}`}>
                <span className={`${styles.statNumber} ${styles.statNumberCompact}`}>{vm.hitsCorrect}</span>
                <span className={`${styles.statLabel} ${styles.statLabelCompact}`}>Đúng</span>
              </div>
              <div className={`${styles.statItem} ${styles.statItemCompact}`}>
                <span className={`${styles.statNumber} ${styles.statNumberCompact}`}>{vm.missCount}</span>
                <span className={`${styles.statLabel} ${styles.statLabelCompact}`}>Sai</span>
              </div>
              <div className={`${styles.statItem} ${styles.statItemCompact}`}>
                <span className={`${styles.statNumber} ${styles.statNumberCompact}`}>{vm.accuracy}%</span>
                <span className={`${styles.statLabel} ${styles.statLabelCompact}`}>Độ chính xác</span>
              </div>
            </section>

            {/* Danh sách hợp âm theo tiến trình của tone (đang chọn) */}
            <section style={{ marginTop: 24 }}>
              {(() => {
                const degreeMap = { I: 0, ii: 1, iii: 2, IV: 3, V: 4, vi: 5, "vii°": 6, vii: 6 };
                const chords = toneChords[vm.selectedTone] || [];
                const tokens = (vm.progressionPreset || "").split('-').map((t) => t.trim());
                const progressionChords = tokens
                  .map((deg) => chords[degreeMap[deg]] || chords[0])
                  .filter(Boolean);
                return (
                  <>
                    <div className={styles.toneLabel}>Tiến trình {vm.progressionPreset} trong {vm.selectedTone}:</div>
                    <div className={styles.chipRow}>
                      {progressionChords.map((c, idx) => (
                        <div key={`${c}-${idx}`} className={styles.chip}>{c}</div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


