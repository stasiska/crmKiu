import React from 'react';
import ActionDropdown from '../../../../components/ActionDropdown';

const GroupsTable = ({ groups, onRowClick, onEdit, onDelete, loading }) => {
  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Наименование</th>
            <th>Менеджер</th>
            <th>Подразделение</th>
            <th>Статус</th>
            <th>Часы</th>
            <th>Формат</th>
            <th style={{ textAlign: 'center' }}>Слушатели</th>
            <th style={{ textAlign: 'center' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.id} onClick={() => onRowClick(g)} style={{ cursor: 'pointer' }}>
              <td>{g.course_name || '—'}</td>
              <td>{g.manager_name || '—'}</td>
              <td>{g.branch || '—'}</td>
              <td>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: g.status === 'открыта' ? '#dcfce7' : g.status === 'завершена' ? '#f3f4f6' : '#fef3c7',
                  color: g.status === 'открыта' ? '#166534' : g.status === 'завершена' ? '#6b7280' : '#92400e'
                }}>
                  {g.status || 'набор'}
                </span>
              </td>
              <td>{g.hours ? `${String(g.hours).slice(0, 2)} ч` : '—'}</td>
              <td>{g.format || '—'}</td>
              <td style={{ textAlign: 'center' }}>{g.listeners_count || 0}</td>
              <td style={{ textAlign: 'center' }}>
                <ActionDropdown
                  onEdit={(e) => {
                    if (e) e.stopPropagation();
                    onEdit(g);
                  }}
                  onDelete={(e) => {
                    if (e) e.stopPropagation();
                    onDelete(g.id);
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

export default GroupsTable;