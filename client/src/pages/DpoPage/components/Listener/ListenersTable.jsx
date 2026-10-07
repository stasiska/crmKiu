import React from 'react';
import ActionDropdown from '../../../../components/ActionDropdown';

const ListenersTable = ({ listeners, onRowClick, onEdit, onDelete, onAddToGroup, loading, selectedIds = [], onToggleSelect }) => {
  if (loading) return <div>Загрузка...</div>;

  const formatEducation = (level) => {
    if (!level) return '—';
    if (level === 'higher') return 'ВО';
    if (level === 'secondary') return 'СПО';
    if (level === 'basic') return 'Аттестат';
    return level;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    try {
      return new Date(date).toLocaleDateString('ru-RU');
    } catch {
      return date;
    }
  };

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
                      onToggleSelect(listeners.map(l => l.id));
                    } else {
                      onToggleSelect([]);
                    }
                  }
                }}
                checked={selectedIds.length > 0 && selectedIds.length === listeners.length}
              />
            </th>
            <th>ФИО</th>
            <th>Организация</th>
            <th>Дата рождения</th>
            <th>СНИЛС</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>ВО/СПО</th>
            <th>Менеджер</th>
            <th>Подразделение</th>
            <th style={{ textAlign: 'center' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {listeners.map((l) => (
            <tr key={l.id} onClick={() => onRowClick(l)} style={{ cursor: 'pointer' }}>
              <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(l.id)}
                  onChange={(e) => {
                    if (onToggleSelect) {
                      if (e.target.checked) {
                        onToggleSelect([...selectedIds, l.id]);
                      } else {
                        onToggleSelect(selectedIds.filter(id => id !== l.id));
                      }
                    }
                  }}
                />
              </td>
              <td>{`${l.last_name} ${l.first_name} ${l.middle_name || ''}`}</td>
              <td>{l.organization_name || '—'}</td>
              <td>{formatDate(l.birth_date)}</td>
              <td>{l.snils || '—'}</td>
              <td>{l.email || '—'}</td>
              <td>{l.phone || '—'}</td>
              <td>{formatEducation(l.education_level)}</td>
              <td>{l.manager_name || '—'}</td>
              <td>{l.department || '—'}</td>
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