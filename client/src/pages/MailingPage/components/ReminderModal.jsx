import React, { useState, useEffect } from 'react';
import { createReminder, fetchReminders, updateReminder, deleteReminder } from '../../../api';

const ReminderModal = ({ recipient, onClose, onSuccess }) => {
  const [existingReminder, setExistingReminder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Загружаем напоминание
  useEffect(() => {
    const loadReminder = async () => {
      try {
        const reminders = await fetchReminders({ recipientId: recipient.id });
        if (reminders.length > 0) {
          const rem = reminders[0];
          setExistingReminder(rem);
          // В PostgreSQL поле называется reminder_date
          if (rem.reminder_date) {
            const dateObj = new Date(rem.reminder_date);
            if (!isNaN(dateObj)) {
              const iso = dateObj.toISOString();
              setDate(iso.split('T')[0]);
              setTime(iso.split('T')[1].slice(0, 5));
            }
          }
          setMessage(rem.message || '');
        }
      } catch (err) {
        console.error('Ошибка загрузки напоминания:', err);
      }
    };
    loadReminder();
  }, [recipient.id]);

  const showToast = (text, type = 'info') => {
    setToast({ text, type });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      showToast('Выберите дату и время', 'error');
      return;
    }
    const reminderDate = new Date(`${date}T${time}:00`).toISOString();
    setLoading(true);
    try {
      await createReminder({
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        reminderDate,
        message: message || `Напомнить о контакте ${recipient.email}`,
      });
      showToast('Напоминание создано', 'success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err) {
      showToast('Ошибка: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!existingReminder) return;
    if (!date || !time) {
      showToast('Выберите дату и время', 'error');
      return;
    }
    const reminderDate = new Date(`${date}T${time}:00`).toISOString();
    setLoading(true);
    try {
      await updateReminder(existingReminder.id, { reminderDate, message });
      showToast('Напоминание обновлено', 'success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err) {
      showToast('Ошибка: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!existingReminder) return;
    setLoading(true);
    try {
      await updateReminder(existingReminder.id, { isCompleted: true });
      showToast('Напоминание выполнено', 'success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err) {
      showToast('Ошибка: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!existingReminder) return;
    setLoading(true);
    try {
      await deleteReminder(existingReminder.id);
      showToast('Напоминание удалено', 'success');
      setConfirmDelete(false);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err) {
      showToast('Ошибка: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
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
      <div
        className="modal-content"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '28px 32px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
      >
        {toast && (
          <div
            style={{
              padding: '10px 16px',
              marginBottom: '16px',
              borderRadius: '8px',
              background: toast.type === 'success' ? '#d1fae5' : toast.type === 'error' ? '#fde8e8' : '#e0e7ff',
              color: toast.type === 'success' ? '#065f46' : toast.type === 'error' ? '#991b1b' : '#1e3a8a',
              border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : toast.type === 'error' ? '#f5c6cb' : '#b3c6ff'}`,
            }}
          >
            {toast.text}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>
            🔔 Напоминание
          </h3>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {recipient.email}
          </span>
        </div>

        {existingReminder && !editing && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', color: '#4b5563' }}>📅 Дата и время</span>
                  <span style={{ fontWeight: 600, fontSize: '15px', color: '#1f2937' }}>{formatDate(existingReminder.reminder_date)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#4b5563' }}>📝 Сообщение</span>
                  <span style={{ fontSize: '15px', color: '#1f2937' }}>{existingReminder.message || '—'}</span>
                </div>
              </div>
              <div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: existingReminder.is_completed ? '#d1fae5' : '#fef3c7',
                  color: existingReminder.is_completed ? '#065f46' : '#92400e',
                }}>
                  {existingReminder.is_completed ? '✅ Выполнено' : '⏳ Активно'}
                </span>
              </div>
            </div>

            {confirmDelete ? (
              <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', marginBottom: '16px' }}>
                <p style={{ margin: '0 0 12px', fontWeight: 500, color: '#991b1b' }}>Вы уверены, что хотите удалить это напоминание?</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleDeleteConfirmed} style={{ padding: '8px 20px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Да, удалить</button>
                  <button onClick={cancelDelete} style={{ padding: '8px 20px', background: '#e5e7eb', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => setEditing(true)} style={{ padding: '10px 20px', background: '#1557a6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>✏️ Редактировать</button>
                {!existingReminder.is_completed && (
                  <button onClick={handleComplete} style={{ padding: '10px 20px', background: '#16845b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>✅ Выполнено</button>
                )}
                <button onClick={() => setConfirmDelete(true)} style={{ padding: '10px 20px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>🗑 Удалить</button>
                <button onClick={onClose} style={{ padding: '10px 20px', background: '#e5e7eb', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>Закрыть</button>
              </div>
            )}
          </div>
        )}

        {(!existingReminder || editing) && (
          <form onSubmit={editing ? handleUpdate : handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>Дата</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d9e0e8' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>Время</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d9e0e8' }} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>Сообщение (необязательно)</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="form-control" rows="2" placeholder="Текст напоминания" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d9e0e8', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-kiu" disabled={loading} style={{ padding: '10px 24px', background: '#1557a6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Сохранение...' : editing ? 'Обновить' : 'Создать'}
              </button>
              {editing && (
                <button type="button" onClick={() => setEditing(false)} style={{ padding: '10px 20px', background: '#e5e7eb', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
              )}
              <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#e5e7eb', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>Закрыть</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReminderModal;