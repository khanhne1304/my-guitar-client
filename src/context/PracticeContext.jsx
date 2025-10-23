import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const PracticeContext = createContext();

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error("usePractice must be used within a PracticeProvider");
  }
  return context;
};

export const PracticeProvider = ({ children }) => {
  const { user, isAuthenticated, authChecked, checkAuthStatus } = useAuth();
  const [practiceProgress, setPracticeProgress] = useState({
    1: {
      title: "Luyện tập ghi nhớ hợp âm",
      description: "Học và ghi nhớ các hợp âm cơ bản",
      totalChords: 100,
      completedChords: 0,
      progressData: [
        { chord: "C", completed: false },
        { chord: "G", completed: false },
        { chord: "Am", completed: false },
        { chord: "F", completed: false },
        { chord: "D", completed: false },
        { chord: "Em", completed: false },
        { chord: "Dm", completed: false },
        { chord: "A", completed: false },
        { chord: "E", completed: false },
        { chord: "Bm", completed: false }
      ]
    },
    2: {
      title: "Luyện tập chuyển hợp âm", 
      description: "Thực hành chuyển đổi giữa các hợp âm",
      totalChords: 50,
      completedChords: 0,
      progressData: [
        { from: "C", to: "G", completed: false },
        { from: "G", to: "Am", completed: false },
        { from: "Am", to: "F", completed: false },
        { from: "F", to: "C", completed: false }
      ]
    },
    3: {
      title: "Luyện tập theo nhịp",
      description: "Chơi hợp âm theo nhịp điệu", 
      totalChords: 30,
      completedChords: 0,
      progressData: [
        { tempo: "60 BPM", completed: false },
        { tempo: "80 BPM", completed: false },
        { tempo: "100 BPM", completed: false },
        { tempo: "120 BPM", completed: false }
      ]
    }
  });

  // Kiểm tra auth status khi component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Load progress from localStorage on mount - chỉ khi đã check auth và đăng nhập
  useEffect(() => {
    if (authChecked && isAuthenticated && user?.id) {
      const storageKey = `practiceProgress_${user.id}`;
      const savedProgress = localStorage.getItem(storageKey);
      if (savedProgress) {
        try {
          setPracticeProgress(JSON.parse(savedProgress));
        } catch (error) {
          console.error('Error loading practice progress:', error);
        }
      }
    } else if (authChecked && !isAuthenticated) {
      // Reset progress khi logout
      setPracticeProgress({
        1: {
          title: "Luyện tập ghi nhớ hợp âm",
          description: "Học và ghi nhớ các hợp âm cơ bản",
          totalChords: 100,
          completedChords: 0,
          progressData: [
            { chord: "C", completed: false },
            { chord: "G", completed: false },
            { chord: "Am", completed: false },
            { chord: "F", completed: false },
            { chord: "D", completed: false },
            { chord: "Em", completed: false },
            { chord: "Dm", completed: false },
            { chord: "A", completed: false },
            { chord: "E", completed: false },
            { chord: "Bm", completed: false }
          ]
        },
        2: {
          title: "Luyện tập chuyển hợp âm", 
          description: "Thực hành chuyển đổi giữa các hợp âm",
          totalChords: 50,
          completedChords: 0,
          progressData: [
            { from: "C", to: "G", completed: false },
            { from: "G", to: "Am", completed: false },
            { from: "Am", to: "F", completed: false },
            { from: "F", to: "C", completed: false }
          ]
        },
        3: {
          title: "Luyện tập theo nhịp",
          description: "Chơi hợp âm theo nhịp điệu", 
          totalChords: 30,
          completedChords: 0,
          progressData: [
            { tempo: "60 BPM", completed: false },
            { tempo: "80 BPM", completed: false },
            { tempo: "100 BPM", completed: false },
            { tempo: "120 BPM", completed: false }
          ]
        }
      });
    }
  }, [authChecked, isAuthenticated, user?.id]);

  // Save progress to localStorage whenever it changes - chỉ khi đã check auth và đăng nhập
  useEffect(() => {
    if (authChecked && isAuthenticated && user?.id) {
      const storageKey = `practiceProgress_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(practiceProgress));
    }
  }, [practiceProgress, authChecked, isAuthenticated, user?.id]);

  const updateProgress = (practiceId, itemIndex, completed) => {
    // Chỉ cho phép cập nhật khi đã đăng nhập
    if (!isAuthenticated) {
      console.warn('Practice progress can only be updated when logged in');
      return;
    }
    
    setPracticeProgress(prev => ({
      ...prev,
      [practiceId]: {
        ...prev[practiceId],
        progressData: prev[practiceId].progressData.map((item, index) => 
          index === itemIndex ? { ...item, completed } : item
        )
      }
    }));
  };

  const getProgressStats = (practiceId) => {
    const practice = practiceProgress[practiceId];
    if (!practice) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = practice.progressData.filter(item => item.completed).length;
    const total = practice.progressData.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const resetProgress = () => {
    setPracticeProgress({
      1: {
        title: "Luyện tập ghi nhớ hợp âm",
        description: "Học và ghi nhớ các hợp âm cơ bản",
        totalChords: 100,
        completedChords: 0,
        progressData: [
          { chord: "C", completed: false },
          { chord: "G", completed: false },
          { chord: "Am", completed: false },
          { chord: "F", completed: false },
          { chord: "D", completed: false },
          { chord: "Em", completed: false },
          { chord: "Dm", completed: false },
          { chord: "A", completed: false },
          { chord: "E", completed: false },
          { chord: "Bm", completed: false }
        ]
      },
      2: {
        title: "Luyện tập chuyển hợp âm", 
        description: "Thực hành chuyển đổi giữa các hợp âm",
        totalChords: 50,
        completedChords: 0,
        progressData: [
          { from: "C", to: "G", completed: false },
          { from: "G", to: "Am", completed: false },
          { from: "Am", to: "F", completed: false },
          { from: "F", to: "C", completed: false }
        ]
      },
      3: {
        title: "Luyện tập theo nhịp",
        description: "Chơi hợp âm theo nhịp điệu", 
        totalChords: 30,
        completedChords: 0,
        progressData: [
          { tempo: "60 BPM", completed: false },
          { tempo: "80 BPM", completed: false },
          { tempo: "100 BPM", completed: false },
          { tempo: "120 BPM", completed: false }
        ]
      }
    });
  };

  const value = {
    practiceProgress,
    updateProgress,
    getProgressStats,
    resetProgress,
    isAuthenticated,
    user
  };

  return (
    <PracticeContext.Provider value={value}>
      {children}
    </PracticeContext.Provider>
  );
};
