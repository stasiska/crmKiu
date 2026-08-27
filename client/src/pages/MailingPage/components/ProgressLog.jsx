import React, { useContext, useRef, useEffect } from 'react';
import { AppContext } from '../../../context/AppContext';

const ProgressLog = () => {
  const { progressLogs, sendStatus, isSending } = useContext(AppContext);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [progressLogs]);

  const getMessageClass = (type) => {
    switch (type) {
      case 'sent': return 'text-success';
      case 'error': return 'text-danger';
      case 'pause': return 'text-warning';
      case 'done': return 'text-success fw-bold';
      case 'info': return 'text-info';
      default: return '';
    }
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'sent': return '#16845b';
      case 'error': return '#c0392b';
      case 'pause': return '#f5c842';
      case 'done': return '#16845b';
      case 'info': return '#1557a6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard-card progress-card" style={{
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
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Прогресс рассылки</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>Журнал выполнения операций</p>
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
        }}>05</span>
      </div>

      <div className="progress-log" ref={logContainerRef} style={{
        height: '220px',
        overflowY: 'auto',
        padding: '14px',
        background: '#101923',
        borderRadius: '9px',
        color: '#d8e2ed',
        fontFamily: 'Consolas, Courier New, monospace',
        fontSize: '12px',
        lineHeight: '1.65',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
      }}>
        {progressLogs.length === 0 && !isSending && (
          <div style={{ color: '#6b7280' }}>Нет активных операций</div>
        )}
        {progressLogs.length === 0 && isSending && (
          <div style={{ color: '#1557a6' }}>⏳ Ожидание начала отправки...</div>
        )}
        {progressLogs.map((log, index) => (
          <div key={index} style={{ color: getMessageColor(log.type) }}>
            {log.message}
          </div>
        ))}
        {isSending && (
          <div style={{ color: '#1557a6' }}>⏳ Отправка в процессе... {sendStatus}</div>
        )}
        {!isSending && sendStatus && progressLogs.length > 0 && (
          <div style={{ color: '#6b7280', marginTop: '4px' }}>🏁 Статус: {sendStatus}</div>
        )}
      </div>
    </div>
  );
};

export default ProgressLog;