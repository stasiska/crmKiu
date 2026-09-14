import React from 'react';
import ActionDropdown from '../../../../components/ActionDropdown';

const OrganizationsTable = ({ organizations, onRowClick, onEdit, onDelete, loading }) => {
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
            <th style={{ textAlign: 'center' }}>Действия</th>
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
              <td style={{ textAlign: 'center' }}>
                <ActionDropdown
                  onEdit={(e) => {
                    if (e) e.stopPropagation();
                    onEdit(org);
                  }}
                  onDelete={(e) => {
                    if (e) e.stopPropagation();
                    onDelete(org.id);
                  }}
                  onPrint={(e) => {
                    if (e) e.stopPropagation();
                    alert('Печать в разработке');
                  }}
                  onAddToGroup={(e) => {
                    if (e) e.stopPropagation();
                    alert('Добавление в группу в разработке');
                  }}
                  onContract={(e) => {
                    if (e) e.stopPropagation();
                    alert('Формирование договора в разработке');
                  }}
                  onInvoice={(e) => {
                    if (e) e.stopPropagation();
                    alert('Выставление счёта в разработке');
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrganizationsTable;