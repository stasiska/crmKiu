import React, { useState, useEffect } from 'react';
import { fetchNotifications, fetchReminders, markNotificationAsRead } from '../../api';
import NotificationItem from './components/NotificationItem';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, reminders

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifs, rems] = await Promise.all([
        fetchNotifications(),
        fetchReminders({ isCompleted: false }) // только активные напоминания
      ]);
      setNotifications(notifs);
      setReminders(rems);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleReminderUpdate = () => {
    // перезагружаем напоминания после обновления
    loadData();
  };

  const getFilteredData = () => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.is_read);
    } else if (filter === 'reminders') {
      return reminders;
    } else {
      return [...notifications, ...reminders.map(r => ({ ...r, is_reminder: true }))];
    }
  };

  const data = getFilteredData();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>🔔 Уведомления и напоминания</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setFilter('all')} style={{ padding: '8px 16px', background: filter === 'all' ? '#1557a6' : '#e5e7eb', color: filter === 'all' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            Все
          </button>
          <button onClick={() => setFilter('unread')} style={{ padding: '8px 16px', background: filter === 'unread' ? '#1557a6' : '#e5e7eb', color: filter === 'unread' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            Непрочитанные
          </button>
          <button onClick={() => setFilter('reminders')} style={{ padding: '8px 16px', background: filter === 'reminders' ? '#1557a6' : '#e5e7eb', color: filter === 'reminders' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            Напоминания
          </button>
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
        {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Загрузка...</div>}
        {!loading && data.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Нет уведомлений</div>}
        {data.map(item => {
          // Если это напоминание (есть поле reminder_date), используем NotificationItem
          if (item.reminder_date) {
            return (
              <NotificationItem
                key={item.id}
                reminder={item}
                onUpdate={handleReminderUpdate}
              />
            );
          }
          // Иначе это системное уведомление
          return (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              marginBottom: '8px',
              background: item.is_read ? '#f9fafb' : '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>🔔 {item.message}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
              {!item.is_read && (
                <button onClick={() => handleMarkAsRead(item.id)} style={{ padding: '4px 12px', background: '#1557a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Прочитано
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPage;