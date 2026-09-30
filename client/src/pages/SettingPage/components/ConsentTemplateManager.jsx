import React, { useEffect, useRef, useState } from 'react';
import { createDocumentTemplate, fetchDocumentTemplates, updateDocumentTemplate } from '../../../api';

const CONSENT_CODE = 'listener_personal_data_consent';
const CONSENT_NAME = 'Согласие слушателя на обработку персональных данных';

const DocumentConsentTemplate = ({ templateCode, templateName, title }) => {
  const [template, setTemplate] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const loadTemplate = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const templates = await fetchDocumentTemplates();
      setTemplate(templates.find(item => item.code === templateCode) || null);
    } catch (err) {
      setLoadError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplate();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file || saving) return;

    setSaving(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      let savedTemplate;
      if (template) {
        if (!template.is_active) formData.append('is_active', 'true');
        savedTemplate = await updateDocumentTemplate(template.id, formData);
      } else {
        formData.append('code', templateCode);
        formData.append('name', templateName);
        savedTemplate = await createDocumentTemplate(formData);
      }
      setTemplate(savedTemplate);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMessage({ type: 'success', text: 'Шаблон согласия сохранён' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section style={{ marginTop: '28px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
      <h2 style={{ fontSize: '18px', margin: '0 0 12px' }}>{title}</h2>
      {loading ? (
        <p>Загрузка...</p>
      ) : loadError ? (
        <div role="alert" style={{ fontSize: '14px', color: '#b91c1c' }}>
          <p>Не удалось загрузить шаблон: {loadError}</p>
          <button type="button" onClick={loadTemplate}>Повторить</button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '14px', margin: '0 0 12px', color: '#4b5563' }}>
            {template ? `Загружен: ${template.file_name || 'DOCX'}${template.is_active ? '' : ' (неактивен)'}` : 'Шаблон не загружен'}
          </p>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              aria-label={`${title} DOCX`}
              onChange={(event) => { setFile(event.target.files[0] || null); setMessage(null); }}
              disabled={saving}
              required
              style={{ maxWidth: '100%' }}
            />
            <button type="submit" className="btn btn-kiu" disabled={saving || !file}>
              {saving ? 'Сохранение...' : template ? 'Заменить шаблон' : 'Загрузить шаблон'}
            </button>
          </form>
        </>
      )}
      {message && <p role={message.type === 'error' ? 'alert' : 'status'} style={{ color: message.type === 'error' ? '#b91c1c' : '#16845b', fontSize: '14px' }}>{message.text}</p>}
    </section>
  );
};

const ConsentTemplateManager = () => (
  <>
    <DocumentConsentTemplate
      templateCode={CONSENT_CODE}
      templateName={CONSENT_NAME}
      title="Шаблон согласия на обработку персональных данных"
    />
    <DocumentConsentTemplate
      templateCode="listener_personal_data_distribution_consent"
      templateName="Согласие слушателя на распространение персональных данных"
      title="Шаблон согласия на распространение персональных данных"
    />
  </>
);

export default ConsentTemplateManager;
