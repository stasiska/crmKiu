import React, { useContext } from 'react';
import { AppContext } from '../../../context/AppContext';

const SendersList = () => {
  const { senders, selectedSenderId, setSelectedSenderId } = useContext(AppContext);

    if (!Array.isArray(senders) || senders.length === 0) {
    return (
      <div className="alert alert-warning" style={{ padding: '16px', borderRadius: '8px', background: '#fef9e7', border: '1px solid #f5c842' }}>
        Нет добавленных отправителей. Добавьте их в панели управления.
      </div>
    );
  }

  if (!senders || senders.length === 0) {
    return (
      <div className="alert alert-warning" style={{ padding: '16px', borderRadius: '8px', background: '#fef9e7', border: '1px solid #f5c842' }}>
        Нет добавленных отправителей. Добавьте их в панели управления.
      </div>
    );
  }

  return (
    <div className="senders-container">
      {senders.map((sender) => {
        const isActive = sender.id === selectedSenderId;
        const status = sender.status || {};
        const isAllowed = status.allowed !== undefined ? status.allowed : true;
        const dotClass = isAllowed ? 'green' : 'red';
        const statusText = isAllowed
          ? 'Доступно'
          : status.reason === 'rate_limit'
          ? 'Лимит 10/10мин'
          : 'Суточный лимит';

        return (
          <div
            key={sender.id}
            className={`sender-card ${isActive ? 'active' : ''}`}
            onClick={() => setSelectedSenderId(sender.id)}
          >
            <strong>{sender.name}</strong>
            <br />
            <small>{sender.email}</small>
            <div className="sender-status">
              <span className={`status-dot ${dotClass}`}></span>
              <span className={`status-text ${dotClass}`}>{statusText}</span>
            </div>
            <div className="sender-stats">
              <span>📤 {status.recent ?? 0}/{status.limit ?? 10} за 10мин</span>
              <span>📅 {status.daily ?? 0}/{status.dailyLimit ?? 150} за день</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SendersList;