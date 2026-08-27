import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import SendersManager from './components/SendersManager';
import TemplatesManager from './components/TemplatesManager';
import UsersManager from './components/UsersManager';
import DangerZone from './components/DangerZone';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('senders');
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Настройки</h1>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('senders')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            fontSize: '16px',
            fontWeight: activeTab === 'senders' ? 600 : 400,
            color: activeTab === 'senders' ? '#1557a6' : '#6b7280',
            borderBottom: activeTab === 'senders' ? '2px solid #1557a6' : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          Отправители
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            fontSize: '16px',
            fontWeight: activeTab === 'templates' ? 600 : 400,
            color: activeTab === 'templates' ? '#1557a6' : '#6b7280',
            borderBottom: activeTab === 'templates' ? '2px solid #1557a6' : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          Шаблоны
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              fontSize: '16px',
              fontWeight: activeTab === 'users' ? 600 : 400,
              color: activeTab === 'users' ? '#1557a6' : '#6b7280',
              borderBottom: activeTab === 'users' ? '2px solid #1557a6' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Пользователи
          </button>
        )}
      </div>

      {activeTab === 'senders' && <SendersManager />}
      {activeTab === 'templates' && <TemplatesManager />}
      {activeTab === 'users' && <UsersManager />}
      <DangerZone />
    </div>
  );
};

export default SettingsPage;