import React from 'react';

const ListenerCard = ({ listener, onClose, onEdit, onDelete, onOpenOrganization }) => {
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('ru-RU') : '—';

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', margin: '0 0 10px 0', borderBottom: '2px solid #e5e7eb', paddingBottom: '6px' }}>
        {title}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
        {children}
      </div>
    </div>
  );

  const Field = ({ label, value }) => (
    <div style={{ fontSize: '14px', color: '#4b5563' }}>
      <span style={{ fontWeight: 500, color: '#1f2937' }}>{label}:</span> {value || '—'}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '800px', background: '#fff', padding: '28px 32px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Карточка слушателя</h3>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {`${listener.last_name} ${listener.first_name} ${listener.middle_name || ''}`}
          </span>
        </div>

        <Section title="Основная информация">
          <Field label="ФИО" value={`${listener.last_name} ${listener.first_name} ${listener.middle_name || ''}`} />
          <Field label="Дата рождения" value={formatDate(listener.birth_date)} />
          <Field label="Пол" value={listener.gender === 'male' ? 'Мужской' : listener.gender === 'female' ? 'Женский' : '—'} />
          <Field label="Гражданство" value={listener.citizenship} />
          <Field label="Телефон" value={listener.phone} />
          <Field label="Email" value={listener.email} />
        </Section>

        <Section title="Документы">
          <Field label="Документ" value={listener.identity_document} />
          <Field label="Серия" value={listener.document_series} />
          <Field label="Номер" value={listener.document_number} />
          <Field label="Выдан" value={listener.issued_by} />
          <Field label="СНИЛС" value={listener.snils} />
        </Section>

        <Section title="Адреса">
          <Field label="Проживания" value={listener.residence_address} />
          <Field label="Регистрации" value={listener.registration_address} />
        </Section>

        <Section title="Образование">
          <Field label="Уровень" value={listener.education_level === 'higher' ? 'Высшее' : listener.education_level === 'secondary' ? 'СПО' : listener.education_level === 'basic' ? 'Аттестат' : '—'} />
          <Field label="Серия документа" value={listener.education_series} />
          <Field label="Номер документа" value={listener.education_number} />
        </Section>

        <Section title="Работа и привязки">
          {/* Организация — кликабельная */}
          <div style={{ fontSize: '14px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 500, color: '#1f2937' }}>Организация:</span>
            {listener.organization_id ? (
              <span
                onClick={() => onOpenOrganization(listener.organization_id)}
                style={{ color: '#1557a6', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {listener.organization_name || 'Без названия'}
              </span>
            ) : (
              <span>—</span>
            )}
          </div>
          <Field label="Менеджер" value={listener.manager_name} />
          <Field label="Подразделение" value={listener.department} />
        </Section>

        <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <button onClick={onEdit} className="btn btn-kiu">Редактировать</button>
          <button onClick={onDelete} style={{ background: '#c0392b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Удалить</button>
          <button onClick={onClose} style={{ background: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default ListenerCard;