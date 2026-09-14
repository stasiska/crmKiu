import React, { useContext } from 'react';
import { AppContext } from '../../../../context/AppContext';

const GroupsFilters = ({ filters, onFilterChange }) => {
  const { users } = useContext(AppContext);

  const handleChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value, page: 1 });
  };

  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ flex: '1 1 250px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937', display: 'block', marginBottom: '4px' }}>
          Поиск
        </label>
        <input
          type="text"
          placeholder="Название, курс..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d9e0e8',
            borderRadius: '6px'
          }}
        />
      </div>

      <div style={{ flex: '0 1 180px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937', display: 'block', marginBottom: '4px' }}>
          Менеджер
        </label>
        <select
          value={filters.manager_id || ''}
          onChange={(e) => handleChange('manager_id', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d9e0e8',
            borderRadius: '6px'
          }}
        >
          <option value="">Все</option>
          {users?.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '0 1 150px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937', display: 'block', marginBottom: '4px' }}>
          Статус
        </label>
        <select
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d9e0e8',
            borderRadius: '6px'
          }}
        >
          <option value="">Все</option>
          <option value="набор">Набор</option>
          <option value="открыта">Открыта</option>
          <option value="завершена">Завершена</option>
        </select>
      </div>

      <div style={{ flex: '0 1 140px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937', display: 'block', marginBottom: '4px' }}>
          Часы от
        </label>
        <input
          type="number"
          min="0"
          placeholder="0"
          value={filters.hours_min || ''}
          onChange={(e) => handleChange('hours_min', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d9e0e8',
            borderRadius: '6px'
          }}
        />
      </div>

      <div style={{ flex: '0 1 140px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937', display: 'block', marginBottom: '4px' }}>
          Часы до
        </label>
        <input
          type="number"
          min="0"
          placeholder="∞"
          value={filters.hours_max || ''}
          onChange={(e) => handleChange('hours_max', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d9e0e8',
            borderRadius: '6px'
          }}
        />
      </div>

      {(filters.search || filters.manager_id || filters.status || filters.hours_min || filters.hours_max) && (
        <button
          onClick={() => onFilterChange({ search: '', manager_id: '', status: '', hours_min: '', hours_max: '', page: 1 })}
          style={{
            padding: '8px 16px',
            background: '#f3f4f6',
            border: '1px solid #d9e0e8',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#6b7280'
          }}
        >
          Сбросить
        </button>
      )}
    </div>
  );
};

export default GroupsFilters;
