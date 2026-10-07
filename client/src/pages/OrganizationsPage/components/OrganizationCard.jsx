import React from 'react';

const OrganizationCard = ({ organization, onClose, onEdit, onDelete }) => {
  return (
    <div className="modal-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '600px', background: '#fff', padding: '24px', borderRadius: '12px' }}>
        <h3>Карточка юридического лица</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><strong>Краткое наименование:</strong> {organization.name || '—'}</div>
          <div><strong>Полное наименование:</strong> {organization.full_name || organization.name || '—'}</div>
          <div><strong>Адрес:</strong> {organization.address || '—'}</div>
          <div><strong>E-mail:</strong> {organization.email || '—'}</div>
          <div><strong>Телефон:</strong> {organization.phone || '—'}</div>
          <div><strong>Контактное лицо:</strong> {organization.contact_person || '—'}</div>
          <div><strong>ИНН организации:</strong> {organization.inn || '—'}</div>
          <div><strong>КПП организации:</strong> {organization.kpp || '—'}</div>
          <div><strong>Расчётный счёт:</strong> {organization.settlement_account || '—'}</div>
          <div><strong>Банк:</strong> {organization.bank_name || '—'}</div>
          <div><strong>Корреспондентский счёт:</strong> {organization.correspondent_account || '—'}</div>
          <div><strong>БИК:</strong> {organization.bik || '—'}</div>
          <div><strong>ОГРН:</strong> {organization.ogrn || '—'}</div>
          <div><strong>ИНН банка:</strong> {organization.bank_inn || '—'}</div>
          <div><strong>КПП банка:</strong> {organization.bank_kpp || '—'}</div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onEdit} className="btn btn-kiu">Редактировать</button>
          <button onClick={onDelete} style={{ background: '#c0392b', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px' }}>Удалить</button>
          <button onClick={onClose} style={{ background: '#e5e7eb', padding: '8px 16px', border: 'none', borderRadius: '6px' }}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCard;
