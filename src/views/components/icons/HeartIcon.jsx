import React from 'react';

const HeartIcon = ({ isFilled = false, onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`heart-icon ${className}`}
      aria-label={isFilled ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        position: 'relative',
        zIndex: 10
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isFilled ? '#ef4444' : 'none'}
        stroke={isFilled ? '#ef4444' : '#666'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'all 0.2s ease'
        }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
};

export default HeartIcon;
