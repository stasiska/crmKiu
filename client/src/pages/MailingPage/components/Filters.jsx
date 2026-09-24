import React, { useContext } from 'react';
import { AppContext } from '../../../context/AppContext';

const Filters = () => {
  const {
    filters,
    setFilters,
    recipientOrganizations,
  } = useContext(AppContext);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="filters-grid" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px',
      marginBottom: '18px'
    }}>
      <div className="filter-group">
        <label htmlFor="filterOrg" style={{
          display: 'block',
          marginBottom: '6px',
          color: '#4b5563',
          fontSize: '12px',
          fontWeight: 600
        }}>
          Организация
        </label>
        <select
          id="filterOrg"
          name="organization"
          className="form-control"
          value={filters.organization || ''}
          onChange={handleFilterChange}
          style={{ minHeight: '42px', border: '1px solid #d9e0e8', borderRadius: '8px', width: '100%', padding: '0 12px' }}
        >
          <option value="">Все организации</option>
          {recipientOrganizations.map((o) => (
            <option key={o.organization} value={o.organization}>{o.organization}</option>
          ))}
        </select>
      </div>

      <div className="filter-group search-group">
        <label htmlFor="searchInput" style={{
          display: 'block',
          marginBottom: '6px',
          color: '#4b5563',
          fontSize: '12px',
          fontWeight: 600
        }}>
          Поиск по email
        </label>
        <input
          type="text"
          id="searchInput"
          name="search"
          className="form-control"
          placeholder="Введите email для поиска"
          value={filters.search || ''}
          onChange={handleFilterChange}
          style={{ minHeight: '42px', border: '1px solid #d9e0e8', borderRadius: '8px', width: '100%', padding: '0 12px' }}
        />
      </div>
    </div>
  );
};

export default Filters;