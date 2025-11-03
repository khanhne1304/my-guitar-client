import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };
    
    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message, duration) => showToast(message, 'success', duration);
  const error = (message, duration) => showToast(message, 'error', duration);
  const info = (message, duration) => showToast(message, 'info', duration);
  const warning = (message, duration) => showToast(message, 'warning', duration);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const getStyle = () => {
    const baseStyle = {
      minWidth: '300px',
      maxWidth: '500px',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      animation: 'slideIn 0.3s ease-out',
      color: '#000',
      fontSize: '14px',
      fontWeight: '500',
      border: '2px solid #000',
    };

    // Vàng - Đen chủ đạo
    const yellow = '#ffd700';
    const offYellow = '#ffe27a';
    const typeStyles = {
      success: { backgroundColor: yellow },
      error: { backgroundColor: offYellow },
      warning: { backgroundColor: yellow },
      info: { backgroundColor: offYellow },
    };

    return { ...baseStyle, ...typeStyles[toast.type] };
  };

  return (
    <div style={getStyle()}>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: '#000',
          border: '1px solid #000',
          borderRadius: '4px',
          color: '#ffd700',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: '14px',
          lineHeight: '1',
        }}
      >
        Đóng
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

