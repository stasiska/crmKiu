import React from 'react';
import ActionDropdown from '../../../../components/ActionDropdown';

const GroupsTable = ({ groups, onRowClick, onEdit, onDelete, loading, selectedIds = [], onToggleSelect }) => {
  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ width: '40px', textAlign: 'center' }}>
              <input
                type="checkbox"
                onChange={(e) => {
                  if (onToggleSelect) {
                    if (e.target.checked) {
                      onToggleSelect(groups.map(g => g.id));
                    } else {
                      onToggleSelect([]);
                    }
                  }
                }}
                checked={selectedIds.length > 0 && selectedIds.length === groups.length}
              />
            </th>
            <th>Наименование курса</th>
            <th style={{ textAlign: 'center' }}>Статус</th>
            <th style={{ textAlign: 'center' }}>Количество часов</th>
            <th style={{ textAlign: 'center' }}>Период обучения</th>
            <th style={{ textAlign: 'center' }}>Аудитория/Дистант</th>
            <th style={{ textAlign: 'center' }}>Количество слушателей</th>
            <th>Менеджер</th>
            <th style={{ textAlign: 'center' }}>Подразделение</th>
            <th style={{ textAlign: 'center' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.id} onClick={() => onRowClick(g)} style={{ cursor: 'pointer' }}>
              <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(g.id)}
                  onChange={(e) => {
                    if (onToggleSelect) {
                      if (e.target.checked) {
                        onToggleSelect([...selectedIds, g.id]);
                      } else {
                        onToggleSelect(selectedIds.filter(id => id !== g.id));
                      }
                    }
                  }}
                />
              </td>
              <td>{g.course_name || '—'}</td>
              <td style={{ textAlign: 'center' }}>
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
              <td style={{ textAlign: 'center' }}>{g.hours != null && g.hours !== '' ? `${g.hours} ч` : '—'}</td>
              <td style={{ textAlign: 'center' }}>{`${g.start_date ? new Date(g.start_date).toLocaleDateString('ru-RU') : '—'} — ${g.end_date ? new Date(g.end_date).toLocaleDateString('ru-RU') : '—'}`}</td>
              <td style={{ textAlign: 'center' }}>{g.auditorium || g.format || '—'}</td>
              <td style={{ textAlign: 'center' }}>{g.listeners_count || 0}</td>
              <td>{g.manager_name || '—'}</td>
              <td style={{ textAlign: 'center' }}>{g.branch || '—'}</td>
              <td style={{ textAlign: 'center' }}>
                <ActionDropdown
                  onEdit={(e) => {
                    if (e) e.stopPropagation();
                    onEdit(g);
                  }}
                  onPrint={(e) => {
                    if (e) e.stopPropagation();
                    alert('Печать в разработке');
                  }}
                  onDelete={(e) => {
                    if (e) e.stopPropagation();
                    onDelete(g.id);
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