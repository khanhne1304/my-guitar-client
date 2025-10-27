import React from 'react';
import styles from './VirtualHand.module.css';

const VirtualHand = ({ fingerMapping, chordData }) => {
  const { frets, barre } = chordData;
  
  // Lấy màu sắc cho ngón tay
  const getFingerColor = (fingerNumber) => {
    const colors = {
      1: '#ff6b6b', // Ngón trỏ - đỏ
      2: '#4ecdc4', // Ngón giữa - xanh lá
      3: '#45b7d1', // Ngón áp út - xanh dương
      4: '#f9ca24', // Ngón út - vàng
    };
    return colors[fingerNumber] || '#e0c2a5'; // Màu da người cho ngón không sử dụng
  };

  // Phân tích các ngón tay đang được sử dụng
  const getActiveFingers = () => {
    const activeFingers = new Set();
    
    // Kiểm tra barre
    if (barre) {
      activeFingers.add(1); // Barre luôn dùng ngón trỏ
    }
    
    // Kiểm tra các nốt khác
    frets.forEach((fret, index) => {
      if (typeof fret === 'number' && fret > 0) {
        const stringNumber = 6 - index;
        const isInBarre = barre && fret === barre.fret && 
          stringNumber >= barre.toString && stringNumber <= barre.fromString;
        
        if (!isInBarre && fingerMapping[index]) {
          activeFingers.add(fingerMapping[index]);
        }
      }
    });
    
    return Array.from(activeFingers).sort();
  };

  const activeFingers = getActiveFingers();

  // Kiểm tra xem ngón tay có đang được sử dụng không
  const isFingerActive = (fingerNumber) => {
    return activeFingers.includes(fingerNumber);
  };

  // Lấy thông tin chi tiết về ngón tay
  const getFingerInfo = (fingerNumber) => {
    const info = {
      name: '',
      description: '',
      positions: []
    };

    switch (fingerNumber) {
      case 1:
        info.name = 'Ngón trỏ';
        info.description = barre ? 'Barre + các nốt riêng lẻ' : 'Các nốt riêng lẻ';
        break;
      case 2:
        info.name = 'Ngón giữa';
        info.description = 'Các nốt ở vị trí trung bình';
        break;
      case 3:
        info.name = 'Ngón áp út';
        info.description = 'Các nốt ở vị trí cao';
        break;
      case 4:
        info.name = 'Ngón út';
        info.description = 'Các nốt ở vị trí cao nhất';
        break;
      default:
        info.name = 'Không sử dụng';
        info.description = 'Ngón tay không được sử dụng trong hợp âm này';
    }

    // Tìm các vị trí của ngón tay
    frets.forEach((fret, index) => {
      if (typeof fret === 'number' && fret > 0) {
        const stringNumber = 6 - index;
        const isInBarre = barre && fret === barre.fret && 
          stringNumber >= barre.toString && stringNumber <= barre.fromString;
        
        if (isInBarre && fingerNumber === 1) {
          info.positions.push(`Dây ${stringNumber} ngăn ${fret} (Barre)`);
        } else if (!isInBarre && fingerMapping[index] === fingerNumber) {
          info.positions.push(`Dây ${stringNumber} ngăn ${fret}`);
        }
      }
    });

    return info;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Mô phỏng</h3>
      
      <div className={styles.handContainer}>
        {/* SVG bàn tay */}
        <svg 
          width="300" 
          height="400" 
          viewBox="0 0 300 400"
          className={styles.handSvg}
        >
          {/* Bàn tay cơ bản */}
          <g className={styles.handBase}>
            {/* Lòng bàn tay */}
            <ellipse
              cx="150"
              cy="280"
              rx="80"
              ry="60"
              fill="#fdbcb4"
              stroke="#e8a598"
              strokeWidth="2"
            />
            
            {/* Cổ tay */}
            <rect
              x="100"
              y="320"
              width="100"
              height="40"
              rx="20"
              fill="#fdbcb4"
              stroke="#e8a598"
              strokeWidth="2"
            />
          </g>

          {/* Ngón tay */}
          {[1, 2, 3, 4, 5].map((fingerNumber) => {
            const isActive = isFingerActive(fingerNumber);
            const fingerInfo = getFingerInfo(fingerNumber);
            
            // Vị trí các ngón tay
            const fingerPositions = {
              1: { x: 120, y: 200, angle: -15 }, // Ngón trỏ
              2: { x: 150, y: 180, angle: 0 },   // Ngón giữa
              3: { x: 180, y: 200, angle: 15 },  // Ngón áp út
              4: { x: 210, y: 220, angle: 30 },  // Ngón út
              5: { x: 90, y: 250, angle: -30 }   // Ngón cái
            };

            const pos = fingerPositions[fingerNumber];
            const color = isActive ? getFingerColor(fingerNumber) : '#e0c2a5'; // Màu da người cho ngón không sử dụng
            const strokeColor = isActive ? '#000' : '#c4a484'; // Màu viền da người

            return (
              <g key={`finger-${fingerNumber}`} className={styles.fingerGroup}>
                {/* Ngón tay */}
                <ellipse
                  cx={pos.x}
                  cy={pos.y}
                  rx="25"
                  ry="40"
                  fill={color}
                  stroke={strokeColor}
                  strokeWidth="2"
                  opacity={isActive ? 1 : 0.6}
                  className={`${styles.finger} ${isActive ? styles.active : styles.inactive}`}
                />
                
                {/* Số ngón tay */}
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  fontSize="16"
                  fill={isActive ? "#fff" : "#9ca3af"}
                  fontWeight="bold"
                  className={styles.fingerNumber}
                >
                  {fingerNumber}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Thông tin chi tiết về các ngón tay */}
      <div className={styles.fingerDetails}>
        <h4>Chi tiết ngón tay:</h4>
        {[1, 2, 3, 4].map((fingerNumber) => {
          const isActive = isFingerActive(fingerNumber);
          const fingerInfo = getFingerInfo(fingerNumber);
          
          return (
            <div 
              key={`detail-${fingerNumber}`}
              className={`${styles.fingerDetail} ${isActive ? styles.active : styles.inactive}`}
            >
              <div className={styles.fingerHeader}>
                <div 
                  className={styles.fingerIndicator}
                  style={{ 
                    backgroundColor: isActive ? getFingerColor(fingerNumber) : '#e0c2a5' 
                  }}
                ></div>
                <span className={styles.fingerName}>
                  {fingerInfo.name} ({fingerNumber})
                </span>
              </div>
              
              {isActive && (
                <div className={styles.fingerContent}>
                  <p className={styles.fingerDescription}>{fingerInfo.description}</p>
                  {fingerInfo.positions.length > 0 && (
                    <div className={styles.fingerPositions}>
                      <strong>Vị trí:</strong>
                      <ul>
                        {fingerInfo.positions.map((position, index) => (
                          <li key={index}>{position}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualHand;
