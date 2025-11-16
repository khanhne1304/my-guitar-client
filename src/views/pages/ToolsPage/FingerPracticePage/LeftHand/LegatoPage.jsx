import Header from "../../../../components/homeItem/Header/Header";
import { useNavigate } from "react-router-dom";
import styles from "./LegatoPage.module.css";

const LEGATO_LESSONS = {
  beginner: [
    {
      id: "ho-single",
      title: "Hammer-on đơn",
      description: "Luyện tập kỹ thuật hammer-on cơ bản với 2 nốt",
      detailedDescription: `**Mục tiêu bài học:**
- Làm quen với kỹ thuật Hammer-on (HO) cơ bản
- Phát triển lực ngón tay và độ chính xác
- Đạt được âm thanh rõ ràng và đều đặn

**Hướng dẫn thực hiện:**
1. Đặt ngón trỏ (1) lên ngăn 5 dây 2 (B string)
2. Gảy dây để tạo nốt đầu tiên
3. Dùng lực từ ngón giữa (2) hoặc ngón áp út (3) đập mạnh xuống ngăn 7
4. Không cần gảy dây lần thứ hai - âm thanh được tạo ra nhờ lực đập

**Lưu ý quan trọng:**
- Đảm bảo ngón tay đập đủ mạnh để tạo ra âm thanh rõ ràng
- Giữ ngón tay đầu tiên (ngăn 5) vẫn đang nhấn dây khi đập nốt thứ hai
- Luyện tập với metronome để đảm bảo nhịp độ đều đặn
- Bắt đầu chậm (60-70 BPM) rồi tăng dần tốc độ

**Mẹo:**
- Tập trung vào việc tạo ra âm thanh rõ ràng hơn là tốc độ
- Sử dụng phần đầu ngón tay (fingertip) để đập chính xác
- Thư giãn cổ tay và cánh tay, chỉ dùng lực từ ngón tay`,
      targetBpm: 80,
      technique: "Hammer-on",
      duration: "10-15 phút",
      stars: 0,
      tab: {
        strings: [5, 4, 3, 2, 1, 0],
        notes: [
          { string: 2, fret: 5, time: 0 },
          { string: 2, fret: 7, time: 0.5, technique: "h" }
        ],
        chunks: [
          { start: 0, end: 1, name: "Cụm 2 nốt HO" }
        ]
      }
    },
    {
      id: "po-single",
      title: "Pull-off đơn",
      description: "Luyện tập kỹ thuật pull-off cơ bản với 2 nốt",
      detailedDescription: `**Mục tiêu bài học:**
- Làm quen với kỹ thuật Pull-off (PO) cơ bản
- Phát triển kỹ năng kiểm soát ngón tay
- Tạo ra âm thanh rõ ràng khi thả ngón tay

**Hướng dẫn thực hiện:**
1. Đặt cả hai ngón tay: ngón trỏ (1) ở ngăn 5 và ngón giữa (2) ở ngăn 7
2. Gảy dây để tạo nốt đầu tiên (ngăn 7)
3. Kéo ngón tay xuống (như thể đang "nhổ" dây) khi thả ngăn 7
4. Âm thanh nốt thứ hai (ngăn 5) được tạo ra nhờ chuyển động kéo này

**Lưu ý quan trọng:**
- Kéo dây nhẹ nhàng nhưng có lực khi thả ngón tay
- Không kéo quá mạnh sẽ làm dây bị lệch khỏi vị trí
- Giữ ngón tay còn lại (ngăn 5) vẫn đang nhấn dây
- Luyện tập chậm để cảm nhận được chuyển động đúng

**Mẹo:**
- Tưởng tượng như đang "nhổ" dây bằng ngón tay
- Chuyển động nên theo hướng xuống dưới và ra ngoài một chút
- Tập trung vào việc tạo ra âm thanh đều đặn cho cả hai nốt
- Luyện tập với nhiều cặp ngón tay khác nhau (1-2, 2-3, 3-4)`,
      targetBpm: 80,
      technique: "Pull-off",
      duration: "10-15 phút",
      stars: 0,
      tab: {
        strings: [5, 4, 3, 2, 1, 0],
        notes: [
          { string: 2, fret: 7, time: 0 },
          { string: 2, fret: 5, time: 0.5, technique: "p" }
        ],
        chunks: [
          { start: 0, end: 1, name: "Cụm 2 nốt PO" }
        ]
      }
    }
  ],
  intermediate: [
    {
      id: "ho-po-combo",
      title: "Hammer-on + Pull-off kết hợp",
      description: "Kết hợp HO và PO trong một cụm 4 nốt",
      detailedDescription: `**Mục tiêu bài học:**
- Kết hợp nhuần nhuyễn giữa Hammer-on và Pull-off
- Phát triển kỹ năng chuyển đổi giữa các kỹ thuật
- Tạo ra chuỗi legato mượt mà và đều đặn

**Hướng dẫn thực hiện:**
1. Bắt đầu với ngón trỏ (1) ở ngăn 5, gảy dây
2. Đập ngón giữa (2) xuống ngăn 7 (Hammer-on)
3. Kéo ngón giữa (2) để tạo nốt ngăn 5 (Pull-off)
4. Đập ngón giữa (2) xuống ngăn 7 lần nữa (Hammer-on)
5. Lặp lại chuỗi này liên tục

**Lưu ý quan trọng:**
- Đảm bảo chuyển đổi mượt mà giữa HO và PO
- Giữ nhịp độ đều đặn, không bị gián đoạn
- Mỗi nốt phải có âm thanh rõ ràng
- Luyện tập với metronome để phát triển timing

**Mẹo:**
- Tập trung vào việc tạo ra 4 âm thanh rõ ràng và đều nhau
- Thư giãn bàn tay, tránh căng thẳng
- Luyện tập chậm trước, sau đó tăng tốc dần
- Sử dụng chunk mode để luyện tập từng phần nhỏ

**Thử thách:**
- Khi đã quen, thử tăng BPM lên 110-120
- Luyện tập trên các dây khác nhau
- Thử các pattern khác: PO-HO-PO-HO`,
      targetBpm: 100,
      technique: "HO + PO",
      duration: "15-20 phút",
      stars: 0,
      tab: {
        strings: [5, 4, 3, 2, 1, 0],
        notes: [
          { string: 2, fret: 5, time: 0 },
          { string: 2, fret: 7, time: 0.5, technique: "h" },
          { string: 2, fret: 5, time: 1, technique: "p" },
          { string: 2, fret: 7, time: 1.5, technique: "h" }
        ],
        chunks: [
          { start: 0, end: 3, name: "Cụm 4 nốt HO-PO" }
        ]
      }
    }
  ],
  advanced: [
    {
      id: "legato-speed",
      title: "Legato tốc độ cao",
      description: "Chuỗi 6 nốt legato với tốc độ cao",
      detailedDescription: `**Mục tiêu bài học:**
- Phát triển kỹ năng legato tốc độ cao (shred legato)
- Tăng cường độ linh hoạt và sức mạnh của ngón tay
- Đạt được độ chính xác và đều đặn ở tốc độ cao

**Hướng dẫn thực hiện:**
1. Bắt đầu với ngón trỏ (1) ở ngăn 5, gảy dây
2. Đập ngón giữa (2) xuống ngăn 7 (HO)
3. Đập ngón áp út (3) xuống ngăn 9 (HO)
4. Kéo ngón áp út (3) để tạo nốt ngăn 7 (PO)
5. Kéo ngón giữa (2) để tạo nốt ngăn 5 (PO)
6. Đập ngón giữa (2) xuống ngăn 7 lần nữa (HO)
7. Lặp lại chuỗi này liên tục

**Lưu ý quan trọng:**
- Ở tốc độ cao, mỗi chuyển động phải chính xác và hiệu quả
- Giữ các ngón tay gần dây để giảm thời gian di chuyển
- Đảm bảo mỗi nốt đều có âm thanh rõ ràng, không bị mất
- Luyện tập từ chậm (80-90 BPM) rồi tăng dần

**Mẹo:**
- Sử dụng economy of motion - chuyển động tối thiểu
- Giữ bàn tay thư giãn, tránh căng thẳng
- Tập trung vào việc tạo ra âm thanh đều đặn hơn là tốc độ
- Luyện tập với chunk mode để làm quen từng phần

**Thử thách:**
- Khi đã quen, thử tăng BPM lên 140-160
- Luyện tập với các pattern khác nhau
- Thử kết hợp với các kỹ thuật khác như slide và bend`,
      targetBpm: 120,
      technique: "Shred Legato",
      duration: "20-30 phút",
      stars: 0,
      tab: {
        strings: [5, 4, 3, 2, 1, 0],
        notes: [
          { string: 2, fret: 5, time: 0 },
          { string: 2, fret: 7, time: 0.25, technique: "h" },
          { string: 2, fret: 9, time: 0.5, technique: "h" },
          { string: 2, fret: 7, time: 0.75, technique: "p" },
          { string: 2, fret: 5, time: 1, technique: "p" },
          { string: 2, fret: 7, time: 1.25, technique: "h" }
        ],
        chunks: [
          { start: 0, end: 5, name: "Chuỗi 6 nốt" }
        ]
      }
    },
    {
      id: "legato-4-note",
      title: "Chuỗi 4 nốt Legato",
      description: "Mẫu legato 4 nốt trên nhiều dây",
      detailedDescription: `**Mục tiêu bài học:**
- Phát triển kỹ năng legato trên nhiều dây
- Tăng cường khả năng chuyển đổi giữa các dây
- Đạt được độ mượt mà và chính xác khi di chuyển ngang

**Hướng dẫn thực hiện:**
1. Bắt đầu với ngón trỏ (1) ở ngăn 5 dây 3 (G string), gảy dây
2. Đập ngón giữa (2) xuống ngăn 7 dây 3 (HO)
3. Chuyển sang dây 2 (B string), đập ngón trỏ (1) xuống ngăn 5 (HO)
4. Đập ngón giữa (2) xuống ngăn 7 dây 2 (HO)
5. Lặp lại chuỗi này liên tục

**Lưu ý quan trọng:**
- Chuyển đổi giữa các dây phải mượt mà, không bị gián đoạn
- Giữ các ngón tay gần dây để dễ dàng chuyển đổi
- Đảm bảo mỗi nốt đều có âm thanh rõ ràng
- Luyện tập chậm để làm quen với chuyển động ngang

**Mẹo:**
- Sử dụng chuyển động cổ tay nhẹ nhàng để hỗ trợ di chuyển giữa các dây
- Giữ bàn tay ở vị trí cố định, chỉ di chuyển ngón tay
- Tập trung vào việc tạo ra âm thanh đều đặn trên tất cả các dây
- Luyện tập với chunk mode để làm quen từng phần

**Thử thách:**
- Khi đã quen, thử tăng BPM lên 130-150
- Luyện tập với các pattern khác nhau trên nhiều dây
- Thử kết hợp với các kỹ thuật khác như slide và bend
- Luyện tập trên các vị trí khác nhau của cần đàn`,
      targetBpm: 110,
      technique: "Multi-string Legato",
      duration: "20-25 phút",
      stars: 0,
      tab: {
        strings: [5, 4, 3, 2, 1, 0],
        notes: [
          { string: 3, fret: 5, time: 0 },
          { string: 3, fret: 7, time: 0.5, technique: "h" },
          { string: 2, fret: 5, time: 1, technique: "h" },
          { string: 2, fret: 7, time: 1.5, technique: "h" }
        ],
        chunks: [
          { start: 0, end: 3, name: "Cụm 4 nốt đa dây" }
        ]
      }
    }
  ]
};

export default function LegatoPage() {
  const navigate = useNavigate();

  const handleStartPractice = (lesson) => {
    navigate(`/tools/finger-practice/left/legato/practice/${lesson.id}`, {
      state: { lesson }
    });
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < count ? styles.starFilled : styles.starEmpty}>
        ⭐
      </span>
    ));
  };

  return (
    <>
      <Header />
      <main className={styles.legatoPage}>
        <div className={styles.container}>
          <button 
            onClick={() => navigate("/tools/finger-practice/left")} 
            className={styles.backButton}
          >
            ← Quay lại
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Luyện tập Legato</h1>
            <p className={styles.description}>
              Hammer-on, Pull-off và các kỹ thuật legato nâng cao
            </p>
          </div>

          {/* Beginner Section */}
          <section className={styles.levelSection}>
            <h2 className={styles.levelTitle}>Beginner</h2>
            <div className={styles.lessonsGrid}>
              {LEGATO_LESSONS.beginner.map((lesson) => (
                <div key={lesson.id} className={styles.lessonCard}>
                  <div className={styles.lessonHeader}>
                    <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                    <div className={styles.stars}>{renderStars(lesson.stars)}</div>
                  </div>
                  <p className={styles.lessonDescription}>{lesson.description}</p>
                  {lesson.detailedDescription && (
                    <div className={styles.detailedDescription}>
                      {lesson.detailedDescription.split('\n').map((line, idx) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <h4 key={idx} className={styles.detailHeading}>{line.replace(/\*\*/g, '')}</h4>;
                        }
                        if (line.trim() === '') {
                          return <br key={idx} />;
                        }
                        if (line.match(/^\d+\./)) {
                          return <p key={idx} className={styles.detailStep}>{line}</p>;
                        }
                        if (line.startsWith('-')) {
                          return <p key={idx} className={styles.detailBullet}>{line}</p>;
                        }
                        return <p key={idx} className={styles.detailText}>{line}</p>;
                      })}
                    </div>
                  )}
                  <div className={styles.lessonInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Mục tiêu BPM:</span>
                      <span className={styles.infoValue}>{lesson.targetBpm}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Kỹ thuật:</span>
                      <span className={styles.infoValue}>{lesson.technique}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Thời lượng:</span>
                      <span className={styles.infoValue}>{lesson.duration}</span>
                    </div>
                  </div>
                  <button
                    className={styles.startButton}
                    onClick={() => handleStartPractice(lesson)}
                  >
                    Bắt đầu luyện tập
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Intermediate Section */}
          <section className={styles.levelSection}>
            <h2 className={styles.levelTitle}>Intermediate</h2>
            <div className={styles.lessonsGrid}>
              {LEGATO_LESSONS.intermediate.map((lesson) => (
                <div key={lesson.id} className={styles.lessonCard}>
                  <div className={styles.lessonHeader}>
                    <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                    <div className={styles.stars}>{renderStars(lesson.stars)}</div>
                  </div>
                  <p className={styles.lessonDescription}>{lesson.description}</p>
                  {lesson.detailedDescription && (
                    <div className={styles.detailedDescription}>
                      {lesson.detailedDescription.split('\n').map((line, idx) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <h4 key={idx} className={styles.detailHeading}>{line.replace(/\*\*/g, '')}</h4>;
                        }
                        if (line.trim() === '') {
                          return <br key={idx} />;
                        }
                        if (line.match(/^\d+\./)) {
                          return <p key={idx} className={styles.detailStep}>{line}</p>;
                        }
                        if (line.startsWith('-')) {
                          return <p key={idx} className={styles.detailBullet}>{line}</p>;
                        }
                        return <p key={idx} className={styles.detailText}>{line}</p>;
                      })}
                    </div>
                  )}
                  <div className={styles.lessonInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Mục tiêu BPM:</span>
                      <span className={styles.infoValue}>{lesson.targetBpm}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Kỹ thuật:</span>
                      <span className={styles.infoValue}>{lesson.technique}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Thời lượng:</span>
                      <span className={styles.infoValue}>{lesson.duration}</span>
                    </div>
                  </div>
                  <button
                    className={styles.startButton}
                    onClick={() => handleStartPractice(lesson)}
                  >
                    Bắt đầu luyện tập
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Advanced Section */}
          <section className={styles.levelSection}>
            <h2 className={styles.levelTitle}>Advanced</h2>
            <div className={styles.lessonsGrid}>
              {LEGATO_LESSONS.advanced.map((lesson) => (
                <div key={lesson.id} className={styles.lessonCard}>
                  <div className={styles.lessonHeader}>
                    <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                    <div className={styles.stars}>{renderStars(lesson.stars)}</div>
                  </div>
                  <p className={styles.lessonDescription}>{lesson.description}</p>
                  {lesson.detailedDescription && (
                    <div className={styles.detailedDescription}>
                      {lesson.detailedDescription.split('\n').map((line, idx) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <h4 key={idx} className={styles.detailHeading}>{line.replace(/\*\*/g, '')}</h4>;
                        }
                        if (line.trim() === '') {
                          return <br key={idx} />;
                        }
                        if (line.match(/^\d+\./)) {
                          return <p key={idx} className={styles.detailStep}>{line}</p>;
                        }
                        if (line.startsWith('-')) {
                          return <p key={idx} className={styles.detailBullet}>{line}</p>;
                        }
                        return <p key={idx} className={styles.detailText}>{line}</p>;
                      })}
                    </div>
                  )}
                  <div className={styles.lessonInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Mục tiêu BPM:</span>
                      <span className={styles.infoValue}>{lesson.targetBpm}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Kỹ thuật:</span>
                      <span className={styles.infoValue}>{lesson.technique}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Thời lượng:</span>
                      <span className={styles.infoValue}>{lesson.duration}</span>
                    </div>
                  </div>
                  <button
                    className={styles.startButton}
                    onClick={() => handleStartPractice(lesson)}
                  >
                    Bắt đầu luyện tập
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
