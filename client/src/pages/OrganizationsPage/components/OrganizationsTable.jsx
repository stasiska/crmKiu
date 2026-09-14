import React from 'react';

const OrganizationsTable = ({ organizations, onEdit, onDelete, onRowClick, loading }) => {
  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Название</th>
            <th>Адрес</th>
            <th>E-mail</th>
            <th>Телефон</th>
            <th>Контактное лицо</th>
            <th>Менеджер</th>
            <th>Подразделение</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <tr key={org.id} onClick={() => onRowClick(org)} style={{ cursor: 'pointer' }}>
              <td>{org.name}</td>
              <td>{org.address || '—'}</td>
              <td>{org.email || '—'}</td>
              <td>{org.phone || '—'}</td>
              <td>{org.contact_person || '—'}</td>
              <td>{org.manager_name || '—'}</td>
              <td>{org.department || '—'}</td>
              <td>
                <button onClick={(e) => { e.stopPropagation(); onEdit(org); }}>✏️</button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(org.id); }}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrganizationsTable;