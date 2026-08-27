import React, { useState } from 'react';
import { updateReminder, deleteReminder } from '../../../api';

const NotificationItem = ({ reminder, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (reminder.is_completed) return;
    setLoading(true);
    try {
      await updateReminder(reminder.id, { isCompleted: true });
      onUpdate();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить напоминание?')) return;
    setLoading(true);
    try {
      await deleteReminder(reminder.id);
      onUpdate();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    if (isNaN(d)) return '—';
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = !reminder.is_completed && new Date(reminder.reminder_date) < new Date();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid #e5e7eb',
        background: reminder.is_completed ? '#f9fafb' : isOverdue ? '#fef2f2' : '#ffffff',
        borderRadius: '4px',
        transition: 'background 0.2s',
        borderLeft: isOverdue ? '4px solid #c0392b' : '4px solid transparent',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '20px' }}>
          {reminder.is_completed ? '✅' : isOverdue ? '⏰' : '🔔'}
        </span>
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937' }}>
            {reminder.message || 'Без сообщения'}
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            {reminder.recipient_email || 'Без email'} • {formatDate(reminder.reminder_date)}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {!reminder.is_completed && (
          <button
            onClick={handleComplete}
            disabled={loading}
            style={{
              padding: '6px 12px',
              background: '#16845b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            Выполнено
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            padding: '6px 10px',
            background: 'transparent',
            color: '#c0392b',
            border: '1px solid #c0392b',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          🗑
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;