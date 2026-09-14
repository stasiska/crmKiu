import React, { useState, useEffect } from 'react';
import { fetchGroups, addListenersToGroup } from '../../../../api';
import Toast from '../../../../components/Toast';

const AddListenerToGroupModal = ({ listenerId, listenerName, onClose, onSuccess }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await fetchGroups({ limit: 1000 });
        setGroups(data.data || []);
      } catch (err) {
        setToast({ message: 'Ошибка загрузки групп: ' + err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);

  const handleSubmit = async () => {
    if (!selectedGroupId) {
      setToast({ message: 'Выберите группу', type: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await addListenersToGroup(selectedGroupId, [listenerId]);
      setToast({ message: 'Слушатель добавлен в группу', type: 'success' });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } catch (err) {
      setToast({ message: 'Ошибка: ' + err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '500px', background: '#fff', padding: '24px', borderRadius: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 700 }}>Добавить в группу</h3>
        <p style={{ marginBottom: '16px', color: '#4b5563' }}>
          Слушатель: <strong>{listenerName}</strong>
        </p>

        {loading ? (
          <p>Загрузка групп...</p>
        ) : groups.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Нет доступных групп</p>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Выберите группу</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="form-control"
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }}
            >
              <option value="">-- Выберите --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <button onClick={onClose} style={{ background: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Отмена</button>
          <button
            onClick={handleSubmit}
            className="btn btn-kiu"
            disabled={submitting || !selectedGroupId}
          >
            {submitting ? 'Добавление...' : 'Добавить'}
          </button>
        </div>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default AddListenerToGroupModal;