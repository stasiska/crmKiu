import React, { useContext } from 'react';
import { AppContext } from '../../../context/AppContext';

const inputStyle = {
  minHeight: '42px',
  border: '1px solid #d9e0e8',
  borderRadius: '8px',
  width: '100%',
  padding: '0 12px',
};

const Filters = () => {
  const { filters, setFilters, filtersOptions, recipientOrganizations, recipientEmails } = useContext(AppContext);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="filters-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
      <div className="filter-group">
        <label htmlFor="filterOrg" style={{ display: 'block', marginBottom: '6px', color: '#4b5563', fontSize: '12px', fontWeight: 600 }}>Организация</label>
        <input
          id="filterOrg"
          name="organization"
          list="recipient-organizations"
          className="form-control"
          placeholder="Введите или выберите организацию"
          value={filters.organization || ''}
          onChange={handleFilterChange}
          style={inputStyle}
        />
        <datalist id="recipient-organizations">
          {recipientOrganizations.map((o) => (
            <option key={o.organization} value={o.organization} />
          ))}
        </datalist>
      </div>

      <div className="filter-group">
        <label htmlFor="filterDirection" style={{ display: 'block', marginBottom: '6px', color: '#4b5563', fontSize: '12px', fontWeight: 600 }}>Направление</label>
        <input
          id="filterDirection"
          name="direction"
          list="recipient-directions"
          className="form-control"
          placeholder="Введите или выберите направление"
          value={filters.direction || ''}
          onChange={handleFilterChange}
          style={inputStyle}
        />
        <datalist id="recipient-directions">
          {(filtersOptions.directions || []).map((direction) => (
            <option key={direction} value={direction} />
          ))}
        </datalist>
      </div>

      <div className="filter-group search-group">
        <label htmlFor="searchInput" style={{ display: 'block', marginBottom: '6px', color: '#4b5563', fontSize: '12px', fontWeight: 600 }}>Поиск по email</label>
        <input
          type="email"
          id="searchInput"
          name="search"
          list="recipient-emails"
          className="form-control"
          placeholder="Введите или выберите email"
          value={filters.search || ''}
          onChange={handleFilterChange}
          style={inputStyle}
        />
        <datalist id="recipient-emails">
          {recipientEmails.map((email) => (
            <option key={email} value={email} />
          ))}
        </datalist>
      </div>
    </div>
  );
};

export default Filters;
