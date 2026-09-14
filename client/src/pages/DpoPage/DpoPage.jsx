import React, { useState } from 'react';
import ListenersSection from './components/Listener/ListenersSection';
import OrganizationsSection from './components/Organization/OrganizationsSection';
import GroupsSection from './components/Groups/GroupsSection';

const DpoPage = () => {
  const [activeTab, setActiveTab] = useState('listeners');

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
        Слушатели, организации и группы
      </h1>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('listeners')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            fontSize: '16px',
            fontWeight: activeTab === 'listeners' ? 600 : 400,
            color: activeTab === 'listeners' ? '#1557a6' : '#6b7280',
            borderBottom: activeTab === 'listeners' ? '2px solid #1557a6' : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          Слушатели
        </button>
        <button
          onClick={() => setActiveTab('organizations')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            fontSize: '16px',
            fontWeight: activeTab === 'organizations' ? 600 : 400,
            color: activeTab === 'organizations' ? '#1557a6' : '#6b7280',
            borderBottom: activeTab === 'organizations' ? '2px solid #1557a6' : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          Организации
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            fontSize: '16px',
            fontWeight: activeTab === 'groups' ? 600 : 400,
            color: activeTab === 'groups' ? '#1557a6' : '#6b7280',
            borderBottom: activeTab === 'groups' ? '2px solid #1557a6' : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          Группы
        </button>
      </div>

      {activeTab === 'listeners' && <ListenersSection />}
      {activeTab === 'organizations' && <OrganizationsSection />}
      {activeTab === 'groups' && <GroupsSection />}
    </div>
  );
};

export default DpoPage;