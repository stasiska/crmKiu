import React from 'react';
import ActionDropdown from '../../../../components/ActionDropdown';

const ListenersTable = ({ listeners, onRowClick, onEdit, onDelete, onAddToGroup, loading }) => {
  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ФИО</th>
            <th>Организация</th>
            <th>Телефон</th>
            <th>Email</th>
            <th>Менеджер</th>
            <th style={{ textAlign: 'center' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {listeners.map((l) => (
            <tr key={l.id} onClick={() => onRowClick(l)} style={{ cursor: 'pointer' }}>
              <td>{`${l.last_name} ${l.first_name} ${l.middle_name || ''}`}</td>
              <td>{l.organization_name || '—'}</td>
              <td>{l.phone || '—'}</td>
              <td>{l.email || '—'}</td>
              <td>{l.manager_name || '—'}</td>
              <td style={{ textAlign: 'center' }}>
                <ActionDropdown
                  onEdit={(e) => {
                    if (e) e.stopPropagation();
                    onEdit(l);
                  }}
                  onPrint={(e) => {
                    if (e) e.stopPropagation();
                    alert('Печать в разработке');
                  }}
                  onAddToGroup={(e) => {
                    if (e) e.stopPropagation();
                    console.log('ListenersTable: onAddToGroup вызван для', l);
                    onAddToGroup(l);
                  }}
                  onContract={(e) => {
                    if (e) e.stopPropagation();
                    alert('Формирование договора в разработке');
                  }}
                  onInvoice={(e) => {
                    if (e) e.stopPropagation();
                    alert('Выставление счёта в разработке');
                  }}
                  onDelete={(e) => {
                    if (e) e.stopPropagation();
                    onDelete(l.id);
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

export default ListenersTable;