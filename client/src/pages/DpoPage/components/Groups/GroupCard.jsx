import React, { useState } from 'react';
import GroupListenersList from './GroupListenersList';
import GroupDocumentsSection from './GroupDocumentsSection';
import OrderGenerationModal from './OrderGenerationModal';
import { fetchGroup } from '../../../../api';
import Toast from '../../../../components/Toast';

const GroupCard = ({ group, onClose, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [displayedGroup, setDisplayedGroup] = useState(group);
  const [toast, setToast] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [refreshDocuments, setRefreshDocuments] = useState(0);

  const refreshGroup = async () => {
    try {
      setDisplayedGroup(await fetchGroup(group.id));
    } catch (err) {
      setToast({ message: 'Не удалось обновить данные группы: ' + err.message, type: 'error' });
    }
  };

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
      <div className="modal-content" style={{ width: 'min(1200px, 100%)', maxWidth: '1200px', background: '#fff', padding: '28px 32px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Карточка группы</h3>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{displayedGroup.course_name}</span>
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
              <Field label="Наименование" value={displayedGroup.course_name} />
              <Field label="Менеджер" value={displayedGroup.manager_name} />
              <Field label="Подразделение" value={displayedGroup.branch} />
              <Field label="Аудитория" value={displayedGroup.auditorium} />
              <Field label="Итого стоимость группы" value={`${Number(displayedGroup.total_contract_amount || 0).toFixed(2)} ₽`} />
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
                    background: displayedGroup.status === 'открыта' ? '#dcfce7' : displayedGroup.status === 'завершена' ? '#f3f4f6' : '#fef3c7',
                    color: displayedGroup.status === 'открыта' ? '#166534' : displayedGroup.status === 'завершена' ? '#6b7280' : '#92400e'
                  }}>
                    {displayedGroup.status || 'набор'}
                  </span>
                }
              />
              <Field label="Формат обучения" value={displayedGroup.format} />
              <Field label="Часы" value={displayedGroup.hours != null && displayedGroup.hours !== '' ? `${displayedGroup.hours} ч` : '—'} />
              <Field label="Количество слушателей" value={displayedGroup.listeners_count || 0} />
              <Field
                label="Дата начала"
                value={displayedGroup.start_date ? new Date(displayedGroup.start_date).toLocaleDateString('ru-RU') : '—'}
              />
              <Field
                label="Дата окончания"
                value={displayedGroup.end_date ? new Date(displayedGroup.end_date).toLocaleDateString('ru-RU') : '—'}
              />
            </Section>
          </div>
        )}

        {activeTab === 'listeners' && (
          <GroupListenersList groupId={displayedGroup.id} onParticipantsChanged={refreshGroup} />
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
          <button onClick={onEdit} className="btn btn-kiu">Редактировать информацию</button>
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