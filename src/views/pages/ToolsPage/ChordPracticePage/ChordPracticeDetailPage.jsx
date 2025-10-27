import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../../components/homeItem/Header/Header";
import { usePractice } from "../../../../context/PracticeContext";
import { useAuth } from "../../../../context/AuthContext";
import { toneChords } from "../../../../data/toneChords";
import ChordPracticeModal from "../../../../components/practice/ChordPracticeModal/ChordPracticeModal";
import styles from "./ChordPracticeDetailPage.module.css";

export default function ChordPracticeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { practiceProgress, updateProgress, getProgressStats, isAuthenticated } = usePractice();
  const { isAuthenticated: authIsAuthenticated, authChecked, checkAuthStatus } = useAuth();
  const [selectedTone, setSelectedTone] = useState("C / Am");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChord, setSelectedChord] = useState("");

  // Kiểm tra đăng nhập
  useEffect(() => {
    // Kiểm tra lại auth status khi component mount
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Redirect riêng biệt để tránh conflict - chỉ khi đã check auth
  useEffect(() => {
    if (authChecked && !authIsAuthenticated) {
      navigate('/login');
    }
  }, [authChecked, authIsAuthenticated, navigate]);

  const practice = practiceProgress[id] || practiceProgress[1];
  const stats = getProgressStats(id);
  
  // Tính tổng số tất cả hợp âm của tất cả các tone (chỉ cho luyện tập ghi nhớ hợp âm)
  const totalAllChords = id === "1" ? Object.values(toneChords).flat().length : stats.total;
  
  // Lấy danh sách tone options từ dữ liệu tra cứu hợp âm
  const toneOptions = Object.keys(toneChords);

  const handleBack = () => {
    navigate("/tools/chord-practice");
  };

  const handlePracticeChord = (chordName) => {
    setSelectedChord(chordName);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedChord("");
  };

  const handlePracticeSuccess = () => {
    // Cập nhật tiến độ trong context
    // Tìm index của hợp âm trong progressData và đánh dấu completed
    const chordIndex = practice.progressData.findIndex(item => 
      item.chord === selectedChord || item === selectedChord
    );
    
    if (chordIndex !== -1) {
      updateProgress(id, chordIndex, true);
    }
  };

  // Hiển thị loading nếu chưa check auth hoặc chưa đăng nhập
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
    <>
      <Header />
      <main className={styles.detailPage}>
        <div className={styles.container}>
          <button onClick={handleBack} className={styles.backButton}>
            ← Quay lại
          </button>
          
          <div className={styles.header}>
            <h1 className={styles.title}>{practice.title}</h1>
            <p className={styles.description}>{practice.description}</p>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressCard}>
              <h3>Tiến độ hiện tại</h3>
              <div className={styles.progressStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{stats.completed}</span>
                  <span className={styles.statLabel}>Đã hoàn thành</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{totalAllChords}</span>
                  <span className={styles.statLabel}>Tổng số</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {totalAllChords > 0 ? Math.round((stats.completed / totalAllChords) * 100) : 0}%
                  </span>
                  <span className={styles.statLabel}>Hoàn thành</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.content}>
            {id === "1" && (
              <div className={styles.section}>
                <h2>Luyện tập ghi nhớ hợp âm</h2>
                
                {/* Dropdown chọn tone */}
                <div className={styles.toneSelector}>
                  <label htmlFor="tone-select" className={styles.toneLabel}>
                    Chọn tone:
                  </label>
                  <select 
                    id="tone-select"
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className={styles.toneSelect}
                  >
                    {toneOptions.map(tone => (
                      <option key={tone} value={tone}>{tone}</option>
                    ))}
                  </select>
                </div>

                {/* Danh sách hợp âm theo tone đã chọn */}
                <div className={styles.chordsList}>
                  <h3>Hợp âm trong tone {selectedTone}:</h3>
                  <div className={styles.chordsGrid}>
                    {toneChords[selectedTone].map((chord, index) => (
                      <div key={chord} className={styles.chordItem}>
                        <span className={styles.chordName}>{chord}</span>
                        <button 
                          className={styles.practiceBtn}
                          onClick={() => handlePracticeChord(chord)}
                        >
                          Luyện tập
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {id !== "1" && (
              <div className={styles.section}>
                <h2>Bài luyện tập</h2>
                <p>Nội dung chi tiết của bài luyện tập sẽ được hiển thị ở đây...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal luyện tập */}
      <ChordPracticeModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        chordName={selectedChord}
        onSuccess={handlePracticeSuccess}
      />
    </>
  );
}
