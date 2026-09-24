import React, { useState } from 'react';
import { updateRecipient } from '../../../api';

const FIELDS = [
  { key: 'email', label: 'Email', readOnly: true },
  { key: 'organization', label: 'Организация' },
  { key: 'organization_address', label: 'Адрес организации' },
  { key: 'organization_phone', label: 'Телефон организации' },
  { key: 'position', label: 'Должность' },
  { key: 'manager_name', label: 'ФИО руководителя' },
  { key: 'direction', label: 'Наименование направления' },
];

const RecipientEditModal = ({ recipient, onClose, onSaved }) => {
  const [formData, setFormData] = useState(() =>
    FIELDS.reduce((acc, f) => { acc[f.key] = recipient[f.key] || ''; return acc; }, {})
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { email, ...updates } = formData;
      await updateRecipient(recipient.id, updates);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError('Ошибка сохранения: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

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
      <div style={{ background: 'white', borderRadius: '12px', maxWidth: '560px', width: '100%', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>✏️ Редактирование получателя</h3>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fde8e8', border: '1px solid #f5c6cb', borderRadius: '8px', color: '#991b1b', marginBottom: '14px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {FIELDS.map(f => (
              <div key={f.key} style={f.key === 'organization_address' ? { gridColumn: '1 / -1' } : undefined}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#4b5563' }}>
                  {f.label}
                </label>
                <input
                  type="text"
                  value={formData[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  disabled={f.readOnly}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d9e0e8',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: f.readOnly ? '#f3f4f6' : 'white'
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '22px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-kiu"
              style={{ padding: '8px 16px' }}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipientEditModal;
