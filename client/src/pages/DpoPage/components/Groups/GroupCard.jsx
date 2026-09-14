import React, { useState } from 'react';
import GroupListenersList from './GroupListenersList';
import GroupDocumentsSection from './GroupDocumentsSection';
import OrderGenerationModal from './OrderGenerationModal';
import Toast from '../../../../components/Toast';

const GroupCard = ({ group, onClose, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [toast, setToast] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [refreshDocuments, setRefreshDocuments] = useState(0);

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
      <div className="modal-content" style={{ maxWidth: '900px', background: '#fff', padding: '28px 32px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Карточка группы</h3>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{group.course_name}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('info')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              fontSize: '15px',
              fontWeight: activeTab === 'info' ? 600 : 400,
              color: activeTab === 'info' ? '#1557a6' : '#6b7280',
              borderBottom: activeTab === 'info' ? '2px solid #1557a6' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Информация
          </button>
          <button
            onClick={() => setActiveTab('listeners')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              fontSize: '15px',
              fontWeight: activeTab === 'listeners' ? 600 : 400,
              color: activeTab === 'listeners' ? '#1557a6' : '#6b7280',
              borderBottom: activeTab === 'listeners' ? '2px solid #1557a6' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Участники
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              fontSize: '15px',
              fontWeight: activeTab === 'documents' ? 600 : 400,
              color: activeTab === 'documents' ? '#1557a6' : '#6b7280',
              borderBottom: activeTab === 'documents' ? '2px solid #1557a6' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Документы
          </button>
        </div>

        {activeTab === 'info' && (
          <div>
            <Section title="Основная информация">
              <Field label="Наименование" value={group.course_name} />
              <Field label="Менеджер" value={group.manager_name} />
              <Field label="Подразделение" value={group.branch} />
              <Field label="Аудитория" value={group.auditorium} />
            </Section>

            <Section title="Детали курса">
              <Field
                label="Статус"
                value={
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 500,
                    background: group.status === 'открыта' ? '#dcfce7' : group.status === 'завершена' ? '#f3f4f6' : '#fef3c7',
                    color: group.status === 'открыта' ? '#166534' : group.status === 'завершена' ? '#6b7280' : '#92400e'
                  }}>
                    {group.status || 'набор'}
                  </span>
                }
              />
              <Field label="Формат обучения" value={group.format} />
              <Field label="Часы" value={group.hours ? `${String(group.hours).slice(0, 2)} ч` : '—'} />
              <Field label="Количество слушателей" value={group.listeners_count || 0} />
              <Field
                label="Дата начала"
                value={group.start_date ? new Date(group.start_date).toLocaleDateString('ru-RU') : '—'}
              />
              <Field
                label="Дата окончания"
                value={group.end_date ? new Date(group.end_date).toLocaleDateString('ru-RU') : '—'}
              />
            </Section>
          </div>
        )}

        {activeTab === 'listeners' && (
          <GroupListenersList groupId={group.id} />
        )}

        {activeTab === 'documents' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Документы группы</h4>
              <button
                onClick={() => setShowOrderModal(true)}
                className="btn btn-kiu"
                style={{ fontSize: '14px' }}
              >
                + Сформировать приказ
              </button>
            </div>
            <GroupDocumentsSection key={refreshDocuments} groupId={group.id} />
          </div>
        )}

        <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <button onClick={onEdit} className="btn btn-kiu">Редактировать</button>
          <button onClick={onDelete} style={{ background: '#c0392b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Удалить</button>
          <button onClick={onClose} style={{ background: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Закрыть</button>
        </div>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>

      {showOrderModal && (
        <OrderGenerationModal
          groupId={group.id}
          onClose={() => setShowOrderModal(false)}
          onSuccess={() => {
            setRefreshDocuments(prev => prev + 1);
            setActiveTab('documents');
          }}
        />
      )}
    </div>
  );
};

export default GroupCard;