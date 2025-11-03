import React, { createContext, useContext, useState } from 'react';

const ConfirmContext = createContext();

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null);

  const confirm = (message, onConfirm, onCancel) => {
    return new Promise((resolve) => {
      setConfirmState({
        message,
        onConfirm: () => {
          if (onConfirm) onConfirm();
          resolve(true);
          setConfirmState(null);
        },
        onCancel: () => {
          if (onCancel) onCancel();
          resolve(false);
          setConfirmState(null);
        },
      });
    });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState && <ConfirmDialog {...confirmState} />}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
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
        zIndex: 10001,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: '#ffd700',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          border: '2px solid #000',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#000' }}>
          Xác nhận
        </h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#000' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              border: '1px solid #000',
              borderRadius: '6px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#000',
            }}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
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
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

