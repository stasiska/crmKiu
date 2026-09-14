import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const colors = {
    success: '#d1fae5',
    error: '#fde8e8',
    info: '#e0e7ff',
    warning: '#fef3c7',
  };

  const textColors = {
    success: '#065f46',
    error: '#991b1b',
    info: '#1e3a8a',
    warning: '#92400e',
  };

  const borderColors = {
    success: '#a7f3d0',
    error: '#f5c6cb',
    info: '#b3c6ff',
    warning: '#fcd34d',
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '14px 20px',
      borderRadius: '10px',
      background: colors[type] || '#f3f4f6',
      color: textColors[type] || '#1f2937',
      border: `1px solid ${borderColors[type] || '#e5e7eb'}`,
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      zIndex: 9999,
      maxWidth: '400px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'opacity 0.3s',
      opacity: visible ? 1 : 0,
    }}>
      <span>{message}</span>
      <button
        onClick={() => { setVisible(false); if (onClose) onClose(); }}
        style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6b7280' }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;