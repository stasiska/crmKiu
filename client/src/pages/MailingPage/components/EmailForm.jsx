import React, { useContext } from 'react';
import { AppContext } from '../../../context/AppContext';

const EmailForm = () => {
  const {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    subject,
    setSubject,
    body,
    setBody,
    isSending,
    sendStatus,
    handleSend,
    handleStop,
    applyTemplate,
    ignoreDuplicate,
    setIgnoreDuplicate,
    sendError, // ошибка из контекста
  } = useContext(AppContext);

  const handleTemplateChange = (e) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    applyTemplate(id);
  };

  return (
    <div className="dashboard-card" style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      padding: '24px',
      marginBottom: '20px',
      display: 'block'
    }}>
      <div className="section-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        paddingBottom: '17px',
        borderBottom: '1px solid #edf0f4'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Новая рассылка</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>Создайте письмо и отправьте выбранным получателям</p>
        </div>
        <span className="section-number" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          background: '#eaf3ff',
          color: '#1557a6',
          fontSize: '12px',
          fontWeight: 800
        }}>04</span>
      </div>

      <div className="email-form">
        {/* Блок отображения ошибки */}
        {sendError && (
          <div style={{
            padding: '12px 16px',
            background: '#fde8e8',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            color: '#991b1b',
            marginBottom: '12px',
          }}>
            <strong>⚠️ Ошибка:</strong> {sendError}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: '17px' }}>
          <label htmlFor="subjectInput" style={{ display: 'block', marginBottom: '6px', color: '#4b5563', fontSize: '12px', fontWeight: 600 }}>
            Тема письма
          </label>
          <input
            type="text"
            id="subjectInput"
            className="form-control"
            placeholder="Введите тему письма"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
            style={{ minHeight: '42px', border: '1px solid #d9e0e8', borderRadius: '8px', width: '100%', padding: '0 12px' }}
          />
        </div>

        <div className="form-group template-group" style={{ marginBottom: '17px', maxWidth: '500px' }}>
          <label htmlFor="templateSelect" style={{ display: 'block', marginBottom: '6px', color: '#4b5563', fontSize: '12px', fontWeight: 600 }}>
            Шаблон письма
          </label>
          <select
            id="templateSelect"
            className="form-select"
            value={selectedTemplateId || ''}
            onChange={handleTemplateChange}
            disabled={isSending}
            style={{ minHeight: '42px', border: '1px solid #d9e0e8', borderRadius: '8px', width: '100%', padding: '0 12px' }}
          >
            <option value="">-- Ручной ввод --</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '17px' }}>
          <label htmlFor="bodyInput" style={{ display: 'block', marginBottom: '6px', color: '#4b5563', fontSize: '12px', fontWeight: 600 }}>
            Тело письма
          </label>
          <textarea
            id="bodyInput"
            className="form-control email-body"
            rows="8"
            placeholder="Тело письма (HTML). Используйте {email}, {name}, {city}, {specialization}, {phone}, {organization}"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isSending}
            style={{ minHeight: '190px', border: '1px solid #d9e0e8', borderRadius: '8px', width: '100%', padding: '12px', resize: 'vertical', fontFamily: 'Segoe UI, Arial, sans-serif', lineHeight: 1.5 }}
          />
          <div className="textarea-hint" style={{ marginTop: '7px', color: '#6b7280', fontSize: '11px' }}>
            Доступные переменные:
            <code style={{ display: 'inline-block', marginLeft: '4px', padding: '2px 5px', borderRadius: '4px', background: '#eef3f9', color: '#1557a6', fontFamily: 'Consolas, monospace', fontSize: '11px' }}>{'{email}'}</code>
            <code style={{ display: 'inline-block', marginLeft: '4px', padding: '2px 5px', borderRadius: '4px', background: '#eef3f9', color: '#1557a6', fontFamily: 'Consolas, monospace', fontSize: '11px' }}>{'{name}'}</code>
            <code style={{ display: 'inline-block', marginLeft: '4px', padding: '2px 5px', borderRadius: '4px', background: '#eef3f9', color: '#1557a6', fontFamily: 'Consolas, monospace', fontSize: '11px' }}>{'{city}'}</code>
            <code style={{ display: 'inline-block', marginLeft: '4px', padding: '2px 5px', borderRadius: '4px', background: '#eef3f9', color: '#1557a6', fontFamily: 'Consolas, monospace', fontSize: '11px' }}>{'{specialization}'}</code>
            <code style={{ display: 'inline-block', marginLeft: '4px', padding: '2px 5px', borderRadius: '4px', background: '#eef3f9', color: '#1557a6', fontFamily: 'Consolas, monospace', fontSize: '11px' }}>{'{phone}'}</code>
            <code style={{ display: 'inline-block', marginLeft: '4px', padding: '2px 5px', borderRadius: '4px', background: '#eef3f9', color: '#1557a6', fontFamily: 'Consolas, monospace', fontSize: '11px' }}>{'{organization}'}</code>
          </div>
        </div>

        <div className="email-actions" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="form-check me-3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              className="form-check-input"
              id="ignoreDuplicate"
              checked={ignoreDuplicate}
              onChange={(e) => setIgnoreDuplicate(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#1557a6' }}
            />
            <label className="form-check-label" htmlFor="ignoreDuplicate" style={{ fontSize: '13px', color: '#4b5563' }}>
              Разрешить повторную отправку
            </label>
          </div>

          <button
            className="btn btn-send"
            onClick={handleSend}
            disabled={isSending}
            style={{
              padding: '10px 18px',
              color: 'white',
              background: '#16845b',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: isSending ? 'not-allowed' : 'pointer',
              opacity: isSending ? 0.6 : 1
            }}
          >
            📨 Отправить выбранным
          </button>

          <button
            className="btn btn-stop"
            onClick={handleStop}
            style={{
              display: isSending ? 'inline-block' : 'none',
              padding: '10px 18px',
              color: 'white',
              background: '#c0392b',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ⏹ Остановить
          </button>

          <span id="sendStatus" style={{ fontSize: '12px', color: '#4b5563' }}>{sendStatus}</span>
        </div>
      </div>
    </div>
  );
};

export default EmailForm;