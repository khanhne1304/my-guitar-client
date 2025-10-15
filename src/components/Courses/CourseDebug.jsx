// src/components/Courses/CourseDebug.jsx
import React, { useState, useEffect } from 'react';
import { getCourses } from '../../services/courseService';
import styles from './CourseDebug.module.css';

/**
 * CourseDebug Component
 * Component debug để hiển thị thông tin API và state
 */
export default function CourseDebug() {
  const [debugInfo, setDebugInfo] = useState({
    apiResponse: null,
    error: null,
    loading: false,
    timestamp: null
  });

  const [showDebug, setShowDebug] = useState(false);

  // Test API call
  const testAPI = async () => {
    setDebugInfo(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🧪 Testing Course API...');
      const response = await getCourses();
      console.log('✅ API Response:', response);
      
      setDebugInfo({
        apiResponse: response,
        error: null,
        loading: false,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('❌ API Error:', error);
      setDebugInfo({
        apiResponse: null,
        error: error.message,
        loading: false,
        timestamp: new Date().toLocaleString()
      });
    }
  };

  // Auto-test on mount
  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className={styles.debugContainer}>
      <button 
        className={styles.debugToggle}
        onClick={() => setShowDebug(!showDebug)}
      >
        {showDebug ? 'Ẩn Debug' : 'Hiện Debug'} ({debugInfo.timestamp ? '✓' : '○'})
      </button>

      {showDebug && (
        <div className={styles.debugPanel}>
          <div className={styles.debugHeader}>
            <h3>🔍 Course API Debug</h3>
            <button onClick={testAPI} disabled={debugInfo.loading}>
              {debugInfo.loading ? 'Đang test...' : 'Test lại'}
            </button>
          </div>

          <div className={styles.debugContent}>
            {/* API Response */}
            <div className={styles.debugSection}>
              <h4>📡 API Response:</h4>
              {debugInfo.loading ? (
                <div className={styles.loading}>Đang gọi API...</div>
              ) : debugInfo.error ? (
                <div className={styles.error}>
                  <strong>❌ Error:</strong> {debugInfo.error}
                </div>
              ) : debugInfo.apiResponse ? (
                <div className={styles.success}>
                  <div><strong>✅ Success:</strong> {debugInfo.apiResponse.success ? 'Yes' : 'No'}</div>
                  <div><strong>📝 Message:</strong> {debugInfo.apiResponse.message}</div>
                  <div><strong>📊 Data:</strong></div>
                  <pre className={styles.json}>
                    {JSON.stringify(debugInfo.apiResponse.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className={styles.noData}>Chưa có dữ liệu</div>
              )}
            </div>

            {/* Environment Info */}
            <div className={styles.debugSection}>
              <h4>🌍 Environment:</h4>
              <div className={styles.envInfo}>
                <div><strong>Base URL:</strong> {import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:4000/api'}</div>
                <div><strong>Mode:</strong> {import.meta?.env?.MODE || 'development'}</div>
                <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
              </div>
            </div>

            {/* Network Test */}
            <div className={styles.debugSection}>
              <h4>🌐 Network Test:</h4>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:4000/api/courses');
                    const data = await response.json();
                    console.log('Direct fetch result:', data);
                    alert('Direct fetch successful! Check console for details.');
                  } catch (error) {
                    console.error('Direct fetch error:', error);
                    alert('Direct fetch failed: ' + error.message);
                  }
                }}
              >
                Test Direct Fetch
              </button>
            </div>

            {/* Component State */}
            <div className={styles.debugSection}>
              <h4>⚛️ Component State:</h4>
              <div className={styles.stateInfo}>
                <div><strong>Loading:</strong> {debugInfo.loading ? 'Yes' : 'No'}</div>
                <div><strong>Has Error:</strong> {debugInfo.error ? 'Yes' : 'No'}</div>
                <div><strong>Has Response:</strong> {debugInfo.apiResponse ? 'Yes' : 'No'}</div>
                <div><strong>Courses Count:</strong> {debugInfo.apiResponse?.data?.courses?.length || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
