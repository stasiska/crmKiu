import React from 'react';

const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = 'Да', cancelText = 'Отмена' }) => {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }} style={{ zIndex: 10000 }}>
      <div className="modal-content" style={{ maxWidth: '450px', padding: '28px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600 }}>{title || 'Подтверждение'}</h3>
        <p style={{ margin: '0 0 20px 0', color: '#4b5563' }}>{message || 'Вы уверены?'}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ background: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
            {cancelText}
          </button>
          <button onClick={onConfirm} style={{ background: '#c0392b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;