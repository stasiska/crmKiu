import React, { useState, useEffect } from 'react';
import ListenerGroupHistory from '../Listeners/ListenerGroupHistory';
import ListenerNotes from './ListenerNotes';
import ContractGenerationModal from '../Listeners/ContractGenerationModal';
import { fetchListenerGroupHistory, fetchListenerDocuments, downloadListenerDocument, deleteListenerDocument, uploadListenerDocument } from '../../../../api';
import './ListenerCard.css';

const ListenerCard = ({ listener, onClose, onEdit, onDelete, onOpenOrganization }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploadingGroupId, setUploadingGroupId] = useState(null);

  useEffect(() => {
    if (activeTab === 'documents') {
      loadGroups();
      loadDocuments();
    }
  }, [activeTab]);

  const loadGroups = async () => {
    try {
      console.log('Загрузка групп для слушателя:', listener.id);
      const response = await fetchListenerGroupHistory(listener.id, { limit: 100 });
      console.log('Ответ от API:', response);
      setGroups(response.data || []);
      console.log('Установлено групп:', response.data?.length || 0);
    } catch (err) {
      console.error('Ошибка загрузки групп:', err);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetchListenerDocuments(listener.id);
      setDocuments(response.data || []);
    } catch (err) {
      console.error('Ошибка загрузки документов:', err);
    }
  };

  const handleDownloadDocument = async (docId, fileName) => {
    try {
      const blob = await downloadListenerDocument(listener.id, docId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Ошибка скачивания документа:', err);
      alert('Ошибка скачивания документа');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Удалить документ?')) return;

    try {
      await deleteListenerDocument(listener.id, docId);
      loadDocuments(); // Перезагружаем список документов
    } catch (err) {
      console.error('Ошибка удаления документа:', err);
      alert('Ошибка удаления документа');
    }
  };

  const handleContractGenerated = () => {
    loadDocuments(); // Перезагружаем список документов после генерации
  };

  const handleUploadDocument = async (groupId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingGroupId(groupId);

    try {
      const group = groups.find(g => g.id === groupId);
      await uploadListenerDocument(listener.id, file, {
        group_id: groupId,
        document_type: 'contract',
        contract_date: group?.start_date || null,
        customer_full_name: `${listener.last_name} ${listener.first_name} ${listener.middle_name || ''}`.trim()
      });

      loadDocuments(); // Обновляем список документов
      alert('Документ успешно загружен');
    } catch (err) {
      console.error('Ошибка загрузки документа:', err);
      alert('Ошибка загрузки документа: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingGroupId(null);
      event.target.value = ''; // Сбрасываем input
    }
  };

  const handleGenerateContract = (groupId) => {
    console.log('handleGenerateContract вызван с groupId:', groupId);
    console.log('Группы:', groups);
    console.log('Найденная группа:', groups.find(g => g.group_id === groupId));
    setSelectedGroupId(groupId);
    setShowContractModal(true);
    console.log('Модальное окно должно открыться');
  };

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
      <div className="modal-content listener-card-modal" style={{ maxWidth: '900px', background: '#fff', padding: '28px 32px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Карточка слушателя</h3>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {`${listener.last_name} ${listener.first_name} ${listener.middle_name || ''}`}
          </span>
        </div>

        {/* Tabs */}
        <div className="listener-tabs">
          <button
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Основная информация
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            История групп
          </button>
          <button
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Документы
          </button>
          <button
            className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Заметки
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'info' && (
            <>
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
            </>
          )}

          {activeTab === 'history' && (
            <ListenerGroupHistory listenerId={listener.id} />
          )}

          {activeTab === 'documents' && (
            <div>
              {/* Список сгенерированных документов */}
              {documents.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>
                    Сгенерированные документы
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          padding: '12px 16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#f9fafb'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>
                            {doc.document_type === 'contract' ? '📄 Договор' : '📋 Документ'}
                            {doc.course_name && ` — ${doc.course_name}`}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {doc.contract_date && `Дата: ${new Date(doc.contract_date).toLocaleDateString('ru-RU')}`}
                            {doc.customer_full_name && ` • Заказчик: ${doc.customer_full_name}`}
                            {doc.created_at && ` • Создан: ${new Date(doc.created_at).toLocaleDateString('ru-RU')}`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleDownloadDocument(doc.id, doc.file_name)}
                            style={{
                              padding: '6px 12px',
                              background: '#1557a6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            ⬇ Скачать
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>
                Генерация документов
              </h4>

              {console.log('Вкладка документы, количество групп:', groups.length, groups)}

              {groups.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
                  <p>Слушатель не зачислен ни в одну группу</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Добавьте слушателя в группу, чтобы сгенерировать договор
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {groups.map((group) => {
                    console.log('Рендер группы:', group.id, group.course_name);
                    return (
                      <div
                        key={group.id}
                        style={{
                          padding: '16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#fff'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                            {group.course_name}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            {group.start_date && new Date(group.start_date).toLocaleDateString('ru-RU')}
                            {' — '}
                            {group.end_date && new Date(group.end_date).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              console.log('Клик по кнопке договора, group id:', group.id);
                              handleGenerateContract(group.id);
                            }}
                            className="btn btn-kiu"
                            style={{ fontSize: '14px' }}
                          >
                            📄 Сгенерировать
                          </button>
                          <label
                            style={{
                              padding: '8px 16px',
                              background: uploadingGroupId === group.id ? '#9ca3af' : '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: uploadingGroupId === group.id ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              fontWeight: 500,
                              display: 'inline-block'
                            }}
                          >
                            {uploadingGroupId === group.id ? '⏳ Загрузка...' : '⬆ Загрузить'}
                            <input
                              type="file"
                              accept=".docx"
                              onChange={(e) => handleUploadDocument(group.id, e)}
                              disabled={uploadingGroupId === group.id}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <ListenerNotes listenerId={listener.id} />
          )}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <button onClick={onEdit} className="btn btn-kiu">Редактировать</button>
          <button onClick={onDelete} style={{ background: '#c0392b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Удалить</button>
          <button onClick={onClose} style={{ background: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Закрыть</button>
        </div>
      </div>

      {showContractModal && selectedGroupId && (
        <ContractGenerationModal
          isOpen={showContractModal}
          listener={listener}
          group={groups.find(g => g.id === selectedGroupId)}
          onContractGenerated={handleContractGenerated}
          onClose={() => {
            setShowContractModal(false);
            setSelectedGroupId(null);
          }}
        />
      )}
    </div>
  );
};

export default ListenerCard;