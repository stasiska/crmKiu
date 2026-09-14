import React, { useState } from 'react';
import NotesList from './Notes/NotesList';
import NoteModal from './Notes/NoteModal';
import Toast from '../../../../components/Toast';

const OrganizationCard = ({ organization, onClose, onEdit, onDelete }) => {
  if (!organization || !organization.id) {
    return (
      <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-content" style={{ maxWidth: '700px', padding: '40px', textAlign: 'center' }}>
          <p>Данные организации не загружены</p>
          <button onClick={onClose} style={{ marginTop: '16px', background: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Закрыть</button>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('info');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [toast, setToast] = useState(null);

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

  const handleAddNote = () => {
    setEditingNote(null);
    setShowNoteModal(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowNoteModal(true);
  };

  const handleNoteSuccess = () => {
    setShowNoteModal(false);
    setEditingNote(null);
    setToast({ message: 'Запись сохранена', type: 'success' });
    // Здесь можно обновить список заметок, но NotesList сам перезагрузится при повторном рендере
    // Просто принудительно обновим ключ, если нужно – но мы пересоздаём компонент через key в OrganizationCard
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '900px', background: '#fff', padding: '28px 32px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Карточка организации</h3>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{organization.name}</span>
        </div>

        {/* Вкладки */}
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
            Основная информация
          </button>
          <button
            onClick={() => setActiveTab('requisites')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              fontSize: '15px',
              fontWeight: activeTab === 'requisites' ? 600 : 400,
              color: activeTab === 'requisites' ? '#1557a6' : '#6b7280',
              borderBottom: activeTab === 'requisites' ? '2px solid #1557a6' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Реквизиты
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              fontSize: '15px',
              fontWeight: activeTab === 'notes' ? 600 : 400,
              color: activeTab === 'notes' ? '#1557a6' : '#6b7280',
              borderBottom: activeTab === 'notes' ? '2px solid #1557a6' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Заметки и планы
          </button>
        </div>

        {/* Содержимое вкладок */}
        {activeTab === 'info' && (
          <div>
            <Section title="Основная информация">
              <Field label="Название" value={organization.name} />
              <Field label="Адрес" value={organization.address} />
              <Field label="Телефон" value={organization.phone} />
              <Field label="E-mail" value={organization.email} />
            </Section>
            <Section title="Контакты и лица">
              <Field label="Контактное лицо" value={organization.contact_person} />
              <Field label="Менеджер" value={organization.manager_name} />
              <Field label="Подразделение" value={organization.department} />
            </Section>
          </div>
        )}

        {activeTab === 'requisites' && (
          <div>
            <Section title="Реквизиты">
              <Field label="ОГРН" value={organization.ogrn} />
              <Field label="ОКПО" value={organization.okpo} />
              <Field label="ОКВЭД" value={organization.okved} />
              <Field label="ОКФС" value={organization.okfs} />
              <Field label="ОКОПФ" value={organization.okopf} />
              <Field label="ОКАТО" value={organization.okato} />
              <Field label="ИНН" value={organization.inn} />
              <Field label="КПП" value={organization.kpp} />
            </Section>
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Управление заметками и планами</span>
              <div>
                <button onClick={handleAddNote} className="btn btn-kiu" style={{ marginRight: '8px' }}>+ Заметка</button>
                <button
                  onClick={() => {
                    setEditingNote({ type: 'plan' });
                    setShowNoteModal(true);
                  }}
                  className="btn btn-kiu"
                  style={{ background: '#16845b' }}
                >
                  + План
                </button>
              </div>
            </div>
            <NotesList
              key={organization.id + '_notes'}
              organizationId={organization.id}
              onEdit={handleEditNote}
            />
          </div>
        )}

        <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <button onClick={onEdit} className="btn btn-kiu">Редактировать</button>
          <button onClick={onDelete} style={{ background: '#c0392b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Удалить</button>
          <button onClick={onClose} style={{ background: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Закрыть</button>
        </div>

        {showNoteModal && (
          <NoteModal
            organizationId={organization.id}
            onClose={() => setShowNoteModal(false)}
            onSuccess={handleNoteSuccess}
            initialData={editingNote}
          />
        )}

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default OrganizationCard;