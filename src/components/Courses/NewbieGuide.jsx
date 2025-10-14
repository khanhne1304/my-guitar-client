import React, { useState } from 'react';
import styles from './NewbieGuide.module.css';

const NewbieGuide = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Chào mừng đến với Guitar Cơ Bản!",
      content: "Đây là khóa học dành cho người mới bắt đầu học guitar. Chúng tôi sẽ hướng dẫn bạn từ những bước đầu tiên.",
      icon: "🎸"
    },
    {
      title: "Cấu trúc khóa học",
      content: "Khóa học được chia thành 4 module chính: Làm quen với đàn, Kỹ thuật tay trái, Kỹ thuật tay phải, và Bài tập thực hành.",
      icon: "📚"
    },
    {
      title: "Cách học hiệu quả",
      content: "Mỗi bài học có video hướng dẫn, tab/sheet nhạc và ghi chú. Hãy xem video trước, đọc tab, sau đó thực hành.",
      icon: "💡"
    },
    {
      title: "Theo dõi tiến độ",
      content: "Bạn có thể theo dõi tiến độ học tập, đánh dấu bài đã hoàn thành và xem thành tích của mình.",
      icon: "📊"
    },
    {
      title: "Luyện tập đều đặn",
      content: "Hãy luyện tập 15-30 phút mỗi ngày. Kiên nhẫn và đều đặn sẽ giúp bạn tiến bộ nhanh chóng!",
      icon: "⏰"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipGuide = () => {
    setCurrentStep(steps.length);
    if (onClose) onClose();
  };

  if (currentStep >= steps.length) {
    return null;
  }

  return (
    <div className={styles.guideOverlay}>
      <div className={styles.guideModal}>
        <div className={styles.guideHeader}>
          <h2 className={styles.guideTitle}>
            {steps[currentStep].icon} {steps[currentStep].title}
          </h2>
          <button 
            onClick={skipGuide}
            className={styles.skipButton}
          >
            ✕
          </button>
        </div>
        
        <div className={styles.guideContent}>
          <p className={styles.guideText}>
            {steps[currentStep].content}
          </p>
        </div>

        <div className={styles.guideFooter}>
          <div className={styles.stepIndicator}>
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`${styles.stepDot} ${index === currentStep ? styles.active : ''}`}
              />
            ))}
          </div>
          
          <div className={styles.guideButtons}>
            {currentStep > 0 && (
              <button 
                onClick={prevStep}
                className={styles.prevButton}
              >
                ← Trước
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={nextStep}
                className={styles.nextButton}
              >
                Tiếp theo →
              </button>
            ) : (
              <button 
                onClick={skipGuide}
                className={styles.finishButton}
              >
                Bắt đầu học! 🎸
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewbieGuide;
