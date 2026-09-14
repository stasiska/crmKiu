import React from 'react';

const ListenersFilters = ({ filters, onFilterChange, onReset }) => {
  const { search, organization_id, gender, education_level } = filters;

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '16px' }}>
      <div>
        <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563', display: 'block', marginBottom: '2px' }}>Поиск</label>
        <input
          type="text"
          name="search"
          placeholder="ФИО"
          value={search}
          onChange={handleChange}
          style={{ padding: '6px 10px', border: '1px solid #d9e0e8', borderRadius: '6px', width: '200px' }}
        />
      </div>
      <div>
        <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563', display: 'block', marginBottom: '2px' }}>Организация</label>
        <select
          name="organization_id"
          value={organization_id || ''}
          onChange={handleChange}
          style={{ padding: '6px 10px', border: '1px solid #d9e0e8', borderRadius: '6px', minWidth: '160px' }}
        >
          <option value="">Все</option>
          {filters.orgOptions?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563', display: 'block', marginBottom: '2px' }}>Пол</label>
        <select
          name="gender"
          value={gender || ''}
          onChange={handleChange}
          style={{ padding: '6px 10px', border: '1px solid #d9e0e8', borderRadius: '6px', minWidth: '120px' }}
        >
          <option value="">Любой</option>
          <option value="male">Мужской</option>
          <option value="female">Женский</option>
        </select>
      </div>
      <div>
        <label style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563', display: 'block', marginBottom: '2px' }}>Образование</label>
        <select
          name="education_level"
          value={education_level || ''}
          onChange={handleChange}
          style={{ padding: '6px 10px', border: '1px solid #d9e0e8', borderRadius: '6px', minWidth: '150px' }}
        >
          <option value="">Все</option>
          <option value="higher">Высшее</option>
          <option value="secondary">СПО</option>
          <option value="basic">Аттестат</option>
        </select>
      </div>
      <button
        onClick={onReset}
        style={{ padding: '6px 14px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
      >
        Сбросить
      </button>
    </div>
  );
};

export default ListenersFilters;