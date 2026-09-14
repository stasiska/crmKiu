import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, limit, onLimitChange }) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{
          padding: '6px 12px',
          background: currentPage <= 1 ? '#e5e7eb' : '#1557a6',
          color: currentPage <= 1 ? '#6b7280' : 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
        }}
      >
        ← Назад
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            padding: '6px 12px',
            background: p === currentPage ? '#1557a6' : '#f3f4f6',
            color: p === currentPage ? 'white' : '#1f2937',
            border: '1px solid #d9e0e8',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{
          padding: '6px 12px',
          background: currentPage >= totalPages ? '#e5e7eb' : '#1557a6',
          color: currentPage >= totalPages ? '#6b7280' : 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        Вперёд →
      </button>

      <span style={{ fontSize: '14px', color: '#6b7280' }}>
        {currentPage} / {totalPages} страниц
      </span>

      <select
        value={limit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #d9e0e8' }}
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </div>
  );
};

export default Pagination;