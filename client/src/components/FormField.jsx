import React from 'react';

const FormField = ({ label, required, children, fullWidth = false }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...(fullWidth && { gridColumn: '1 / -1' }) }}>
      <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>
        {label} {required && <span style={{ color: '#c0392b' }}>*</span>}
      </label>
      {children}
    </div>
  );
};

export default FormField;