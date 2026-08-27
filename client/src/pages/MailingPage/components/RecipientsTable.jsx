import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import CommentsModal from './CommentsModal';

const RecipientsTable = ({ onRemind }) => {
  const {
    recipients,
    selectedRecipientIds,
    setSelectedRecipientIds,
    handleClearLogs,
  } = useContext(AppContext);

  const [commentModal, setCommentModal] = useState(null);

  const availableCount = useMemo(() => {
    return recipients.filter(r => !r.hasSent).length;
  }, [recipients]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRecipientIds(recipients.map(r => r.id));
    } else {
      setSelectedRecipientIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedRecipientIds(prev => [...prev, id]);
    } else {
      setSelectedRecipientIds(prev => prev.filter(pid => pid !== id));
    }
  };

  const selectFirstN = (n) => {
    const available = recipients.filter(r => !r.hasSent);
    const ids = available.slice(0, n).map(r => r.id);
    setSelectedRecipientIds(ids);
  };

  const isAllSelected = recipients.length > 0 && selectedRecipientIds.length === recipients.length;
  const isIndeterminate = selectedRecipientIds.length > 0 && selectedRecipientIds.length < recipients.length;

  const handleCommentDoubleClick = (recipient) => {
    setCommentModal(recipient);
  };

  return (
    <div className="mt-3">
      {/* Панель инструментов */}
      <div className="selection-toolbar" style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px 14px',
        marginBottom: '15px',
        background: '#f8fafc',
        border: '1px solid #edf0f4',
        borderRadius: '9px'
      }}>
        <label className="select-all-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
            onChange={handleSelectAll}
          />
          <span>Выбрать всех</span>
        </label>

        <div className="selection-divider" style={{ width: '1px', height: '22px', background: '#d9dfe7' }}></div>

        <button className="selection-btn" onClick={() => selectFirstN(10)} style={{
          padding: '6px 11px',
          border: '1px solid #c9d8e9',
          borderRadius: '6px',
          background: 'white',
          color: '#1557a6',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Выбрать 10</button>
        <button className="selection-btn" onClick={() => selectFirstN(20)} style={{
          padding: '6px 11px',
          border: '1px solid #c9d8e9',
          borderRadius: '6px',
          background: 'white',
          color: '#1557a6',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Выбрать 20</button>
        <button className="selection-btn" onClick={() => selectFirstN(30)} style={{
          padding: '6px 11px',
          border: '1px solid #c9d8e9',
          borderRadius: '6px',
          background: 'white',
          color: '#1557a6',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Выбрать 30</button>

        <div className="available-count" style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '12px' }}>
          Доступно: <strong style={{ color: '#1557a6', fontSize: '14px' }}>{availableCount}</strong>
        </div>

        <button className="btn btn-clear" onClick={handleClearLogs} style={{
          color: '#b3362d',
          background: '#fff',
          border: '1px solid #efc9c5',
          padding: '9px 13px',
          fontSize: '13px',
          borderRadius: '6px',
          cursor: 'pointer'
        }}>🗑 Очистить историю</button>
      </div>

      {/* Таблица с фиксированной высотой и прокруткой */}
      <div
        className="table-wrapper"
        style={{
          overflowX: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '9px',
          maxHeight: '500px',
          overflowY: 'auto',
        }}
      >
        <table
          className="table recipients-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '900px',
          }}
        >
          <thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: '#f5f8fc',
            }}
          >
            <tr>
              <th className="checkbox-column" style={{ width: '40px', padding: '12px 10px', borderBottom: '1px solid #dfe5ec', fontSize: '11px', fontWeight: 700, textAlign: 'center' }}>
                <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
              </th>
              <th style={{ padding: '12px 10px', borderBottom: '1px solid #dfe5ec', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px 10px', borderBottom: '1px solid #dfe5ec', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>Имя</th>
              <th style={{ padding: '12px 10px', borderBottom: '1px solid #dfe5ec', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>Телефон</th>
              <th style={{ padding: '12px 10px', borderBottom: '1px solid #dfe5ec', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>Город</th>
              <th style={{ padding: '12px 10px', borderBottom: '1px solid #dfe5ec', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>Организация</th>
              <th style={{ padding: '12px 10px', borderBottom: '1px solid #dfe5ec', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>Специализация</th>
              <th style={{ padding: '12px 10px', borderBottom: '1px solid #dfe5ec', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>Комментарий</th>
              <th style={{ padding: '12px 10px', borderBottom: '1px solid #dfe5ec', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>Последняя отправка</th>
              <th style={{ padding: '12px 10px', borderBottom: '1px solid #dfe5ec', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {recipients.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center" style={{ padding: '11px 10px', textAlign: 'center' }}>Нет получателей</td>
              </tr>
            ) : (
              recipients.map((r) => {
                const isChecked = selectedRecipientIds.includes(r.id);
                const rowClass = r.hasSent ? 'table-warning' : '';
                const lastSent = r.last_sent_at ? new Date(r.last_sent_at).toLocaleString() : '—';
                return (
                  <tr key={r.id} className={rowClass} style={{ background: r.hasSent ? '#fff3cd' : 'transparent' }}>
                    <td style={{ padding: '11px 10px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleSelectOne(r.id, e.target.checked)}
                      />
                    </td>
                    <td style={{ padding: '11px 10px' }}>{r.email}</td>
                    <td style={{ padding: '11px 10px' }}>{r.name || ''}</td>
                    <td style={{ padding: '11px 10px' }}>{r.phone || ''}</td>
                    <td style={{ padding: '11px 10px' }}>{r.city || ''}</td>
                    <td style={{ padding: '11px 10px' }}>{r.organization || ''}</td>
                    <td style={{ padding: '11px 10px' }}>{r.specialization || ''}</td>
                    <td
                      className="comment-cell"
                      onDoubleClick={() => handleCommentDoubleClick(r)}
                      style={{ padding: '11px 10px', cursor: 'pointer' }}
                    >
                      {r.comment || '✏️'}
                    </td>
                    <td style={{ padding: '11px 10px' }}>{lastSent}</td>
                    <td style={{ padding: '11px 10px', textAlign: 'center' }}>
                      <button
                        onClick={() => onRemind(r)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                        title="Создать напоминание"
                      >
                        🔔
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {commentModal && (
        <CommentsModal
          recipient={commentModal}
          onClose={() => setCommentModal(null)}
        />
      )}
    </div>
  );
};

export default RecipientsTable;