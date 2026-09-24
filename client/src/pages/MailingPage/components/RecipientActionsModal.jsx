import React from 'react';

const RecipientActionsModal = ({ recipient, onClose, onRemind, onEdit, onDelete }) => {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '420px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>Действия с получателем</h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{recipient.email}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => {
              onClose();
              onRemind(recipient);
            }}
            style={{
              padding: '14px 18px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f9fafb';
              e.target.style.borderColor = '#1557a6';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#e5e7eb';
            }}
          >
            <span>Создать напоминание</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onEdit(recipient);
            }}
            style={{
              padding: '14px 18px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f9fafb';
              e.target.style.borderColor = '#1557a6';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#e5e7eb';
            }}
          >
            <span>Редактировать данные</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`Удалить получателя ${recipient.email}?`)) {
                onClose();
                onDelete(recipient);
              }
            }}
            style={{
              padding: '14px 18px',
              border: '1px solid #fee2e2',
              borderRadius: '8px',
              background: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.15s',
              color: '#dc2626'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#fef2f2';
              e.target.style.borderColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#fee2e2';
            }}
          >
            <span>Удалить получателя</span>
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            color: '#6b7280'
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default RecipientActionsModal;
