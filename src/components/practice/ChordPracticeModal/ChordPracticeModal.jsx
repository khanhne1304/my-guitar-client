import { useState } from "react";
import styles from "./ChordPracticeModal.module.css";
import { extendedGuitarChords } from "../../../data/chordData";
import { createFingerMapping } from "../../../utils/fingerMapping";

export default function ChordPracticeModal({ 
  isOpen, 
  onClose, 
  chordName, 
  onSuccess 
}) {
  const [selectedPositions, setSelectedPositions] = useState({});
  const [activeFingerSelector, setActiveFingerSelector] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [fretOffset, setFretOffset] = useState(0); // Offset để chuyển ngăn

  // Lấy dữ liệu hợp âm từ chordData
  const chordShape = extendedGuitarChords[chordName];
  
  // Tạo mapping ngón tay từ fingerMapping.js
  const fingerMapping = chordShape ? createFingerMapping(chordShape, chordName) : new Array(6).fill(null);
  
  // Tạo dữ liệu hợp âm cho modal
  const currentChord = chordShape ? {
    frets: chordShape.frets,
    fingers: fingerMapping
  } : { frets: [0, 0, 0, 0, 0, 0], fingers: [0, 0, 0, 0, 0, 0] };

  const handlePositionClick = (stringIndex, fret) => {
    const actualFret = fret + fretOffset; // Tính ngăn thực tế
    const key = `${stringIndex}-${actualFret}`;
    
    // Nếu đang có dropdown mở và click vào vị trí khác
    if (activeFingerSelector && activeFingerSelector !== key) {
      // Xóa vị trí chưa chọn ngón tay và đóng dropdown
      setSelectedPositions(prev => {
        const newPositions = { ...prev };
        const activeKey = activeFingerSelector;
        const activePosition = newPositions[activeKey];
        
        // Nếu vị trí đang chọn chưa có ngón tay, xóa nó
        if (activePosition && activePosition.finger === null) {
          delete newPositions[activeKey];
        }
        
        return newPositions;
      });
      setActiveFingerSelector(null);
      return;
    }
    
    setSelectedPositions(prev => {
      const newPositions = { ...prev };
      if (newPositions[key]) {
        // Nếu đã chọn, bỏ chọn
        delete newPositions[key];
        setActiveFingerSelector(null);
      } else {
        // Nếu chưa chọn, thêm vào và mở dropdown
        newPositions[key] = { string: stringIndex, fret: actualFret, finger: null };
        setActiveFingerSelector(key);
      }
      return newPositions;
    });
  };

  const handleFingerSelect = (stringIndex, fret, finger) => {
    const actualFret = fret + fretOffset; // Tính ngăn thực tế
    const key = `${stringIndex}-${actualFret}`;
    setSelectedPositions(prev => ({
      ...prev,
      [key]: { ...prev[key], finger: finger }
    }));
    // Đóng dropdown sau khi chọn ngón tay
    setActiveFingerSelector(null);
  };

  const handleSubmit = () => {
    // Kiểm tra tất cả vị trí đã chọn
    const selectedKeys = Object.keys(selectedPositions);
    if (selectedKeys.length === 0) {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 2000);
      return;
    }

    // Kiểm tra xem tất cả vị trí có đúng không
    let allCorrect = true;
    for (const key of selectedKeys) {
      const position = selectedPositions[key];
      const stringIndex = position.string;
      const correctFret = currentChord.frets[stringIndex] + fretOffset; // Tính với offset
      const correctFinger = currentChord.fingers[stringIndex];
      
      if (position.fret !== correctFret || position.finger !== correctFinger) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setIsCorrect(true);
      setTimeout(() => {
        // Xóa tất cả các điểm đã đánh dấu khi thành công
        setSelectedPositions({});
        setActiveFingerSelector(null);
        setShowHint(false);
        setIsCorrect(false);
        onSuccess?.();
        onClose();
      }, 1500);
    } else {
      // Tăng số lần sai
      setWrongAttempts(prev => prev + 1);
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 2000);
    }
  };

  const handleHint = () => {
    setShowHint(!showHint);
  };

  const handleExit = () => {
    // Xóa tất cả các điểm đã đánh dấu khi tắt modal
    setSelectedPositions({});
    setActiveFingerSelector(null);
    setShowHint(false);
    setIsCorrect(false);
    setIsWrong(false);
    setWrongAttempts(0);
    setFretOffset(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Luyện tập hợp âm: {chordName}</h2>
          <button onClick={handleExit} className={styles.exitBtn}>✕</button>
        </div>

        <div className={styles.modalContent}>
          {/* Đàn guitar ảo */}
          <div className={styles.guitarContainer}>
            <h3>Chọn vị trí trên đàn guitar:</h3>
            
            {/* Slider để chuyển ngăn */}
            <div className={styles.fretSliderContainer}>
              <input
                type="range"
                min="0"
                max="12"
                value={fretOffset}
                onChange={(e) => setFretOffset(parseInt(e.target.value))}
                className={styles.fretSlider}
              />
              <div className={styles.fretSliderValues}>
                <span>0</span>
                <span>3</span>
                <span>6</span>
                <span>9</span>
                <span>12</span>
              </div>
            </div>
            
             <div className={styles.virtualGuitar}>
               {/* Fretboard */}
              <div className={styles.fretboard}>
                {/* Fret Numbers */}
                <div className={styles.fretNumbers}>
                  {[1, 2, 3, 4, 5, 6].map(fret => (
                    <span key={fret}>{fret + fretOffset}</span>
                  ))}
                </div>
                {/* Strings */}
                {[5, 4, 3, 2, 1, 0].map(stringIndex => (
                  <div 
                    key={stringIndex} 
                    className={styles.stringLine}
                    data-string={6 - stringIndex}
                  >
                    {/* Frets */}
                    {[1, 2, 3, 4, 5, 6].map(fret => {
                      const actualFret = fret + fretOffset;
                      const key = `${stringIndex}-${actualFret}`;
                      const isSelected = selectedPositions[key];
                      const position = selectedPositions[key];
                      const showFingerSelector = activeFingerSelector === key && position && position.finger === null;
                      
                      return (
                        <div
                          key={key}
                          className={`${styles.fretPosition} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handlePositionClick(stringIndex, fret)}
                        >
                          {isSelected && position.finger !== null ? (
                            <div className={styles.fingerCircle}>
                              <span className={styles.fingerNumber}>{position.finger}</span>
                            </div>
                          ) : showFingerSelector ? (
                            <div className={styles.fingerSelector}>
                              {[1, 2, 3, 4].map(finger => (
                                <button
                                  key={finger}
                                  className={styles.fingerOption}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFingerSelect(stringIndex, fret, finger);
                                  }}
                                >
                                  {finger}
                                </button>
                              ))}
                            </div>
                          ) : isSelected ? (
                            <div className={styles.selectedPosition}></div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className={styles.instructions}>
                <h4>Hướng dẫn:</h4>
                <p>• Click vào vị trí trên đàn để chọn</p>
                <p>• Chọn ngón tay từ 1-4</p>
                <p>• Click lại để bỏ chọn</p>
                <p>• Có thể chọn nhiều vị trí cùng lúc</p>
              </div>
            </div>
          </div>

          {/* Gợi ý */}
          {showHint && (
            <div className={styles.hint}>
              <h4>Gợi ý cho hợp âm {chordName}:</h4>
              <div className={styles.chordHint}>
                {currentChord.frets.map((fret, index) => {
                  const stringNumber = 6 - index;
                  const finger = currentChord.fingers[index];
                  
                  if (fret === "x") {
                    return (
                      <div key={index} className={styles.stringHint}>
                        Dây {stringNumber}: Không chơi (X)
                      </div>
                    );
                  } else if (fret === 0) {
                    return (
                      <div key={index} className={styles.stringHint}>
                        Dây {stringNumber}: Mở (O)
                      </div>
                    );
                  } else {
                    return (
                      <div key={index} className={styles.stringHint}>
                        Dây {stringNumber}: Ngăn {fret + fretOffset}, Ngón {finger || 'Mở'}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {/* Thông báo thành công */}
          {isCorrect && (
            <div className={styles.successMessage}>
              🎉 Chính xác! Bạn đã hoàn thành hợp âm {chordName}!
            </div>
          )}

          {/* Thông báo lỗi */}
          {isWrong && (
            <div className={styles.errorMessage}>
              ❌ Chưa chính xác! Hãy thử lại.
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button 
            onClick={handleHint} 
            className={styles.hintBtn}
            disabled={wrongAttempts < 5}
            style={{ 
              opacity: wrongAttempts < 5 ? 0.5 : 1,
              cursor: wrongAttempts < 5 ? 'not-allowed' : 'pointer'
            }}
          >
            {showHint ? 'Ẩn gợi ý' : 'Gợi ý'}
            {wrongAttempts < 5 && ` (${5 - wrongAttempts} lần nữa)`}
          </button>
          <button onClick={handleSubmit} className={styles.submitBtn}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
