import React, { useState, useEffect } from 'react';
import styles from './AchievementSystem.module.css';

/**
 * AchievementSystem Component
 * Hệ thống thành tích và huy hiệu cho người học
 */
export default function AchievementSystem({ achievements = [], onClose }) {
  const [allAchievements, setAllAchievements] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showNewAchievement, setShowNewAchievement] = useState(null);

  // Predefined achievements
  const predefinedAchievements = [
    {
      id: 'first_lesson',
      name: 'Bước đầu tiên',
      description: 'Hoàn thành bài học đầu tiên',
      icon: '🎯',
      points: 50,
      category: 'learning',
      rarity: 'common'
    },
    {
      id: 'first_10',
      name: 'Người học chăm chỉ',
      description: 'Hoàn thành 10 bài tập đầu tiên',
      icon: '📚',
      points: 100,
      category: 'learning',
      rarity: 'common'
    },
    {
      id: 'accuracy_master',
      name: 'Bậc thầy độ chính xác',
      description: 'Đạt độ chính xác 90%',
      icon: '🎯',
      points: 200,
      category: 'skill',
      rarity: 'rare'
    },
    {
      id: 'streak_master',
      name: 'Chuỗi thành công',
      description: 'Đạt chuỗi 5 lần liên tiếp',
      icon: '🔥',
      points: 150,
      category: 'skill',
      rarity: 'uncommon'
    },
    {
      id: 'time_master',
      name: 'Người kiên trì',
      description: 'Dành 1 giờ luyện tập',
      icon: '⏰',
      points: 100,
      category: 'dedication',
      rarity: 'common'
    },
    {
      id: 'metronome_master',
      name: 'Vua nhịp điệu',
      description: 'Sử dụng metronome 30 phút',
      icon: '🥁',
      points: 150,
      category: 'skill',
      rarity: 'uncommon'
    },
    {
      id: 'pitch_perfect',
      name: 'Cao độ hoàn hảo',
      description: 'Phát hiện cao độ chính xác 20 lần',
      icon: '🎵',
      points: 200,
      category: 'skill',
      rarity: 'rare'
    },
    {
      id: 'speed_demon',
      name: 'Tốc độ thần thánh',
      description: 'Hoàn thành bài tập với tốc độ cao',
      icon: '⚡',
      points: 300,
      category: 'skill',
      rarity: 'epic'
    },
    {
      id: 'perfectionist',
      name: 'Người hoàn hảo',
      description: 'Đạt 100% độ chính xác',
      icon: '💎',
      points: 500,
      category: 'skill',
      rarity: 'legendary'
    },
    {
      id: 'dedicated_learner',
      name: 'Học viên tận tụy',
      description: 'Luyện tập 7 ngày liên tiếp',
      icon: '📅',
      points: 300,
      category: 'dedication',
      rarity: 'epic'
    }
  ];

  // Initialize achievements
  useEffect(() => {
    const achievementsWithStatus = predefinedAchievements.map(achievement => ({
      ...achievement,
      earned: achievements.some(earned => earned.id === achievement.id),
      earnedAt: achievements.find(earned => earned.id === achievement.id)?.earnedAt
    }));
    
    setAllAchievements(achievementsWithStatus);
  }, [achievements]);

  // Show new achievement animation
  useEffect(() => {
    const newAchievement = achievements.find(achievement => 
      !achievements.some(prev => prev.id === achievement.id)
    );
    
    if (newAchievement) {
      setShowNewAchievement(newAchievement);
      setTimeout(() => setShowNewAchievement(null), 3000);
    }
  }, [achievements]);

  // Filter achievements
  const filteredAchievements = allAchievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'earned') return achievement.earned;
    if (filter === 'unearned') return !achievement.earned;
    return achievement.category === filter;
  });

  // Get rarity color
  const getRarityColor = (rarity) => {
    const colors = {
      common: '#6b7280',
      uncommon: '#10b981',
      rare: '#3b82f6',
      epic: '#8b5cf6',
      legendary: '#f59e0b'
    };
    return colors[rarity] || colors.common;
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const labels = {
      learning: 'Học tập',
      skill: 'Kỹ năng',
      dedication: 'Kiên trì'
    };
    return labels[category] || category;
  };

  // Get total points
  const totalPoints = achievements.reduce((total, achievement) => 
    total + (achievement.points || 0), 0
  );

  // Get earned count
  const earnedCount = allAchievements.filter(a => a.earned).length;
  const totalCount = allAchievements.length;

  return (
    <div className={styles.achievementSystem}>
      {/* Header */}
      <div className={styles.achievementSystem__header}>
        <div className={styles.achievementSystem__title}>
          <h2>🏆 Hệ thống thành tích</h2>
          <div className={styles.achievementSystem__stats}>
            <span className={styles.achievementSystem__stat}>
              {earnedCount}/{totalCount} thành tích
            </span>
            <span className={styles.achievementSystem__stat}>
              {totalPoints} điểm
            </span>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className={styles.achievementSystem__closeButton}
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.achievementSystem__filters}>
        <button
          className={`${styles.achievementSystem__filter} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button
          className={`${styles.achievementSystem__filter} ${filter === 'earned' ? styles.active : ''}`}
          onClick={() => setFilter('earned')}
        >
          Đã đạt
        </button>
        <button
          className={`${styles.achievementSystem__filter} ${filter === 'unearned' ? styles.active : ''}`}
          onClick={() => setFilter('unearned')}
        >
          Chưa đạt
        </button>
        <button
          className={`${styles.achievementSystem__filter} ${filter === 'learning' ? styles.active : ''}`}
          onClick={() => setFilter('learning')}
        >
          Học tập
        </button>
        <button
          className={`${styles.achievementSystem__filter} ${filter === 'skill' ? styles.active : ''}`}
          onClick={() => setFilter('skill')}
        >
          Kỹ năng
        </button>
        <button
          className={`${styles.achievementSystem__filter} ${filter === 'dedication' ? styles.active : ''}`}
          onClick={() => setFilter('dedication')}
        >
          Kiên trì
        </button>
      </div>

      {/* Achievements Grid */}
      <div className={styles.achievementSystem__grid}>
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`${styles.achievementSystem__achievement} ${
              achievement.earned ? styles.earned : styles.unearned
            } ${showNewAchievement?.id === achievement.id ? styles.new : ''}`}
          >
            <div className={styles.achievementSystem__achievementIcon}>
              {achievement.earned ? achievement.icon : '🔒'}
            </div>
            
            <div className={styles.achievementSystem__achievementContent}>
              <div className={styles.achievementSystem__achievementHeader}>
                <h3 className={styles.achievementSystem__achievementName}>
                  {achievement.name}
                </h3>
                <div className={styles.achievementSystem__achievementBadges}>
                  <span 
                    className={styles.achievementSystem__rarityBadge}
                    style={{ backgroundColor: getRarityColor(achievement.rarity) }}
                  >
                    {achievement.rarity}
                  </span>
                  <span className={styles.achievementSystem__categoryBadge}>
                    {getCategoryLabel(achievement.category)}
                  </span>
                </div>
              </div>
              
              <p className={styles.achievementSystem__achievementDescription}>
                {achievement.description}
              </p>
              
              <div className={styles.achievementSystem__achievementFooter}>
                <span className={styles.achievementSystem__points}>
                  +{achievement.points} điểm
                </span>
                {achievement.earned && achievement.earnedAt && (
                  <span className={styles.achievementSystem__earnedDate}>
                    Đạt được: {new Date(achievement.earnedAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className={styles.achievementSystem__progress}>
        <div className={styles.achievementSystem__progressHeader}>
          <span>Tiến độ thành tích</span>
          <span>{earnedCount}/{totalCount}</span>
        </div>
        <div className={styles.achievementSystem__progressBar}>
          <div 
            className={styles.achievementSystem__progressFill}
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* New Achievement Notification */}
      {showNewAchievement && (
        <div className={styles.achievementSystem__notification}>
          <div className={styles.achievementSystem__notificationContent}>
            <div className={styles.achievementSystem__notificationIcon}>
              {showNewAchievement.icon}
            </div>
            <div className={styles.achievementSystem__notificationText}>
              <h4>Thành tích mới!</h4>
              <p>{showNewAchievement.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



