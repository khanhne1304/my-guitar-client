import React, { useState, useEffect } from 'react';
import styles from './VirtualGuitarNeck.module.css';

const VirtualGuitarNeck = ({ chordData, fingerMapping, chordName }) => {
  const { frets, barre } = chordData;
  const numStrings = 6;
  const numFrets = 5;
  const fretHeight = 40;
  const stringSpacing = 25;
  const neckWidth = (numStrings - 1) * stringSpacing;
  const leftPad = 30;
  const rightPad = 30;
  const totalWidth = leftPad + neckWidth + rightPad;
  const neckHeight = numFrets * fretHeight;
  const headstockHeight = 80; // chiều cao đầu đàn
  const nutY = headstockHeight - 2; // vị trí nut (lược ngựa)
  
  const [animatedNotes, setAnimatedNotes] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);

  // Tính toán vị trí các dây và ngăn
  const getStringPosition = (stringNumber) => {
    // Lật ngược trục X: dây 6 ở trái → dây 1 ở phải
    return (numStrings - stringNumber) * stringSpacing;
  };

  const getFretPosition = (fretNumber) => {
    return fretNumber * fretHeight;
  };

  // Kiểm tra xem có phải barre không
  const isInBarre = (stringNumber, fretNumber) => {
    if (!barre) return false;
    return fretNumber === barre.fret && 
           stringNumber >= barre.toString && 
           stringNumber <= barre.fromString;
  };

  // Lấy màu sắc cho ngón tay
  const getFingerColor = (fingerNumber) => {
    const colors = {
      1: '#ff6b6b', // Ngón trỏ - đỏ
      2: '#4ecdc4', // Ngón giữa - xanh lá
      3: '#45b7d1', // Ngón áp út - xanh dương
      4: '#f9ca24', // Ngón út - vàng
    };
    return colors[fingerNumber] || '#d1d5db'; // Màu xám cho ngón không sử dụng
  };

  // Tạo animation cho các nốt
  useEffect(() => {
    if (!chordData || !fingerMapping) return;
    
    // Reset state
    setShowAnimation(false);
    setAnimatedNotes([]);
    
    // Tạo danh sách nốt cần animation
    const notesToAnimate = [];
    frets.forEach((fret, index) => {
      if (typeof fret === 'number' && fret > 0) {
        const stringNumber = numStrings - index;
        const fingerNumber = fingerMapping[index];
        const isBarreNote = isInBarre(stringNumber, fret);
        
        if (!isBarreNote && fingerNumber) {
          notesToAnimate.push({
            id: `note-${index}`,
            stringNumber,
            fret,
            fingerNumber,
            delay: 0 // Tất cả nốt bay vào cùng lúc
          });
        }
      }
    });
    
    // Set notes trước, sau đó mới bắt đầu animation
    setAnimatedNotes(notesToAnimate);
    
    // Bắt đầu animation sau delay để ngăn đàn trống trơn
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 300); // Delay 300ms để ngăn đàn trống trơn trước
    
    return () => clearTimeout(timer);
  }, [chordData, fingerMapping, chordName]);

  return (
    <div className={styles.container}>
        <h3 className={styles.title}>Hình ảnh</h3>
      <div className={styles.guitarNeck}>
        <svg 
          width={totalWidth} 
          height={neckHeight + 100}
          viewBox={`0 0 ${totalWidth} ${neckHeight + 100}`}
          className={styles.neckSvg}
        >
          {/* Gradient cho màu gỗ */}
          <defs>
            <linearGradient id="woodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="30%" stopColor="#D2691E" />
              <stop offset="60%" stopColor="#CD853F" />
              <stop offset="100%" stopColor="#8B4513" />
            </linearGradient>
            <linearGradient id="headstockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4b2a12" />
              <stop offset="50%" stopColor="#7a421f" />
              <stop offset="100%" stopColor="#4b2a12" />
            </linearGradient>
            <linearGradient id="nutGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f6e7c8" />
              <stop offset="100%" stopColor="#e9d7af" />
            </linearGradient>
          </defs>

          {/* Phần đầu đàn (headstock) - vát cong như acoustic */}
          <path
            d={`M ${leftPad - 18},10
                L ${leftPad + 10},10
                C ${leftPad + 40},10 ${leftPad + 40},10 ${leftPad + 55},26
                L ${leftPad + neckWidth - 55},26
                C ${leftPad + neckWidth - 40},10 ${leftPad + neckWidth - 40},10 ${leftPad + neckWidth - 10},10
                L ${leftPad + neckWidth + 18},10
                L ${leftPad + neckWidth + 18},${headstockHeight}
                L ${leftPad - 18},${headstockHeight}
                Z`}
            fill="url(#headstockGradient)"
            stroke="#3a1f0e"
            strokeWidth="2"
            className={styles.headstock}
          />

          {/* Nut (lược ngựa) màu kem */}
          <rect
            x={leftPad - 1}
            y={nutY}
            width={neckWidth + 2}
            height={6}
            fill="url(#nutGradient)"
            stroke="#d6c39a"
            strokeWidth="1"
            rx={2}
          />

          {/* Tuners (bộ chỉnh dây) */}
          {(() => {
            const tuners = [];
            const leftX = leftPad - 12;
            const rightX = leftPad + neckWidth + 12;
            const yPositions = [22, 40, 58];
            // Trái: dây 6,5,4
            [6,5,4].forEach((s, idx) => {
              tuners.push(
                <g key={`tuner-L-${s}`}>
                  <circle cx={leftX} cy={yPositions[idx]} r="5" fill="#cfcfcf" stroke="#8a8a8a" strokeWidth="1" />
                  <circle cx={leftX} cy={yPositions[idx]} r="2" fill="#e7e7e7" />
                </g>
              );
            });
            // Phải: dây 3,2,1
            [3,2,1].forEach((s, idx) => {
              tuners.push(
                <g key={`tuner-R-${s}`}>
                  <circle cx={rightX} cy={yPositions[idx]} r="5" fill="#cfcfcf" stroke="#8a8a8a" strokeWidth="1" />
                  <circle cx={rightX} cy={yPositions[idx]} r="2" fill="#e7e7e7" />
                </g>
              );
            });
            return tuners;
          })()}

          {/* Cần đàn (neck) với màu gỗ */}
          <rect
            x={leftPad}
            y={headstockHeight}
            width={neckWidth}
            height={neckHeight}
            fill="url(#woodGradient)"
            stroke="#654321"
            strokeWidth="2"
            className={styles.neck}
          />

          {/* Vẽ các dây đàn trên cần đàn */}
          {Array.from({ length: numStrings }, (_, i) => {
            const stringNumber = numStrings - i;
            const x = getStringPosition(stringNumber) + leftPad;
            return (
              <line
                key={`string-${stringNumber}`}
                x1={x}
                y1={headstockHeight}
                x2={x}
                y2={neckHeight + headstockHeight}
                stroke="#333"
                strokeWidth={stringNumber === 1 || stringNumber === 6 ? 3 : 2}
                className={styles.string}
              />
            );
          })}

          {/* Dẫn dây từ nut đến tuners (3 trái, 3 phải) */}
          {(() => {
            const lines = [];
            const yNut = nutY + 3;
            const leftX = leftPad - 12;
            const rightX = leftPad + neckWidth + 12;
            const yPositions = [22, 40, 58];
            const xFor = (s) => getStringPosition(s) + leftPad;
            // dây 6,5,4 → trái
            [6,5,4].forEach((s, idx) => {
              lines.push(
                <line key={`lead-L-${s}`} x1={xFor(s)} y1={yNut} x2={leftX} y2={yPositions[idx]} stroke="#333" strokeWidth={s === 6 ? 3 : 2} />
              );
            });
            // dây 3,2,1 → phải
            [3,2,1].forEach((s, idx) => {
              lines.push(
                <line key={`lead-R-${s}`} x1={xFor(s)} y1={yNut} x2={rightX} y2={yPositions[idx]} stroke="#333" strokeWidth={s === 1 ? 3 : 2} />
              );
            });
            return lines;
          })()}

          {/* Vẽ các ngăn */}
          {Array.from({ length: numFrets + 1 }, (_, i) => {
            const y = getFretPosition(i) + headstockHeight;
            return (
              <line
                key={`fret-${i}`}
                x1={leftPad}
                y1={y}
                x2={leftPad + neckWidth}
                y2={y}
                stroke="#333"
                strokeWidth={i === 0 ? 4 : 2}
                className={styles.fret}
              />
            );
          })}

          {/* Vẽ barre */}
          {barre && (
            <rect
              x={Math.min(getStringPosition(barre.fromString), getStringPosition(barre.toString)) + leftPad - 5}
              y={getFretPosition(barre.fret - 0.5) + headstockHeight}
              width={Math.abs(getStringPosition(barre.toString) - getStringPosition(barre.fromString)) + 10}
              height={fretHeight - 10}
              fill={getFingerColor(1)}
              opacity={0.8}
              rx={5}
              className={styles.barre}
            />
          )}

          {/* Vẽ các nốt và ngón tay */}
          {frets.map((fret, index) => {
            const stringNumber = numStrings - index;
            const x = getStringPosition(stringNumber) + leftPad;
            
            if (fret === 'x') {
              // Dây không chơi
              return (
                <g key={`note-${index}`}>
                  <text
                    x={x}
                    y={headstockHeight - 20}
                    textAnchor="middle"
                    fontSize="16"
                    fill="#dc3545"
                    fontWeight="bold"
                    className={styles.mutedSymbol}
                  >
                    X
                  </text>
                </g>
              );
            } else if (fret === 0) {
              // Dây buông: không hiển thị ký hiệu O theo yêu cầu
              return null;
            } else if (typeof fret === 'number') {
              // Vị trí chính giữa giữa 2 ngăn
              const y = getFretPosition(fret - 0.5) + headstockHeight;
              const fingerNumber = fingerMapping[index];
              const isBarreNote = isInBarre(stringNumber, fret);
              
              if (isBarreNote) {
                // Nốt trong barre - không vẽ thêm gì vì đã có barre
                return null;
              } else {
                // Nốt bình thường với animation
                const noteData = animatedNotes.find(note => note.id === `note-${index}`);
                const shouldAnimate = showAnimation && noteData;
                
                // Chỉ render nốt khi animation bắt đầu
                if (!shouldAnimate) {
                  return null;
                }
                
                return (
                  <g key={`note-${index}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={12}
                      fill={getFingerColor(fingerNumber)}
                      stroke="#fff"
                      strokeWidth={2}
                      className={styles.animatedNote}
                      style={{
                        animationDelay: noteData ? `${noteData.delay}ms` : '0ms'
                      }}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#fff"
                      fontWeight="bold"
                      className={styles.animatedText}
                      style={{
                        animationDelay: noteData ? `${noteData.delay}ms` : '0ms'
                      }}
                    >
                      {fingerNumber}
                    </text>
                  </g>
                );
              }
            }
            return null;
          })}

          {/* Nhãn dây đàn */}
          {Array.from({ length: numStrings }, (_, i) => {
            const stringNumber = numStrings - i;
            const x = getStringPosition(stringNumber) + leftPad;
            return (
              <text
                key={`label-${stringNumber}`}
                x={x}
                y={neckHeight + headstockHeight + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
                fontWeight="bold"
                className={styles.stringLabel}
              >
{stringNumber}
              </text>
            );
          })}

          {/* Nhãn ngăn đàn */}
          {Array.from({ length: numFrets + 1 }, (_, i) => {
            const y = getFretPosition(i) + headstockHeight;
            return (
              <text
                key={`fret-label-${i}`}
                x={leftPad - 10}
                y={y + 4}
                textAnchor="middle"
                fontSize="10"
                fill="#666"
                fontWeight="bold"
                className={styles.fretLabel}
              >
                {i}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Chú thích màu sắc */}
      <div className={styles.legend}>
        <h4>Chú thích ngón tay:</h4>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: getFingerColor(1) }}
            ></div>
            <span>Ngón trỏ (1)</span>
          </div>
          <div className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: getFingerColor(2) }}
            ></div>
            <span>Ngón giữa (2)</span>
          </div>
          <div className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: getFingerColor(3) }}
            ></div>
            <span>Ngón áp út (3)</span>
          </div>
          <div className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: getFingerColor(4) }}
            ></div>
            <span>Ngón út (4)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualGuitarNeck;
