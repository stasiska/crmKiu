import React, { useContext } from 'react';
import { AppContext } from '../../../context/AppContext';

const Filters = () => {
  const {
    filters,
    setFilters,
    filtersOptions,
    organizations,
  } = useContext(AppContext);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="filters-grid" style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr 1fr 1fr', 
      gap: '14px', 
      marginBottom: '18px' 
    }}>
      <div className="filter-group">
        <label htmlFor="filterCity" style={{ 
          display: 'block', 
          marginBottom: '6px', 
          color: '#4b5563', 
          fontSize: '12px', 
          fontWeight: 600 
        }}>
          Город
        </label>
        <select
          id="filterCity"
          name="city"
          className="form-control"
          value={filters.city || ''}
          onChange={handleFilterChange}
          style={{ minHeight: '42px', border: '1px solid #d9e0e8', borderRadius: '8px', width: '100%', padding: '0 12px' }}
        >
          <option value="">Все города</option>
          {filtersOptions.cities.map((c) => (
            <option key={c.city} value={c.city}>{c.city}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filterSpec" style={{ 
          display: 'block', 
          marginBottom: '6px', 
          color: '#4b5563', 
          fontSize: '12px', 
          fontWeight: 600 
        }}>
          Специализация
        </label>
        <select
          id="filterSpec"
          name="specialization"
          className="form-control"
          value={filters.specialization || ''}
          onChange={handleFilterChange}
          style={{ minHeight: '42px', border: '1px solid #d9e0e8', borderRadius: '8px', width: '100%', padding: '0 12px' }}
        >
          <option value="">Все специализации</option>
          {filtersOptions.specializations.map((s) => (
            <option key={s.specialization} value={s.specialization}>{s.specialization}</option>
          ))}
        </select>
      </div>

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
          {organizations.map((o) => (
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
          Поиск
        </label>
        <input
          type="text"
          id="searchInput"
          name="search"
          className="form-control"
          placeholder="Поиск по email или имени"
          value={filters.search || ''}
          onChange={handleFilterChange}
          style={{ minHeight: '42px', border: '1px solid #d9e0e8', borderRadius: '8px', width: '100%', padding: '0 12px' }}
        />
      </div>
    </div>
  );
};

export default Filters;