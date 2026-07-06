import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext(null);

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState(null);

  const alert = (message, type = 'info') => {
    return new Promise((resolve) => {
      setAlertState({
        message: String(message ?? ''),
        type,
        onClose: () => {
          resolve();
          setAlertState(null);
        },
      });
    });
  };

  const success = (message) => alert(message, 'success');
  const error = (message) => alert(message, 'error');
  const warning = (message) => alert(message, 'warning');
  const info = (message) => alert(message, 'info');

  return (
    <AlertContext.Provider value={{ alert, success, error, warning, info }}>
      {children}
      {alertState && <AlertDialog {...alertState} />}
    </AlertContext.Provider>
  );
}

function AlertDialog({ message, type, onClose }) {
  const titles = {
    success: 'Thành công',
    error: 'Lỗi',
    warning: 'Cảnh báo',
    info: 'Thông báo',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10002,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffd700',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '420px',
          width: '90%',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          border: '2px solid #000',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#000' }}>
          {titles[type] || titles.info}
        </h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#000', whiteSpace: 'pre-wrap' }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #000',
              borderRadius: '6px',
              background: '#000',
              color: '#ffd700',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '700',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
