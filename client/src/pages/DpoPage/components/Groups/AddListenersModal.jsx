import React, { useState, useEffect } from 'react';
import { fetchListeners, addListenersToGroup } from '../../../../api';
import Toast from '../../../../components/Toast';

const AddListenersModal = ({ groupId, onClose, onSuccess }) => {
  const [allListeners, setAllListeners] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchListeners({ search, limit: 1000 });
        setAllListeners(data.data || []);
      } catch (err) {
        setToast({ message: 'Ошибка загрузки слушателей: ' + err.message, type: 'error' });
      }
    };
    load();
  }, [search]);

  const handleToggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!selectedIds.length) return;
    setLoading(true);
    try {
      await addListenersToGroup(groupId, selectedIds);
      onSuccess();
    } catch (err) {
      setToast({ message: 'Ошибка: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '700px', background: '#fff', padding: '24px', borderRadius: '16px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 700 }}>Добавить слушателей</h3>

        <input
          type="text"
          placeholder="Поиск слушателей..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8', marginBottom: '12px' }}
        />

        {allListeners.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Нет доступных слушателей</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {allListeners.map((l) => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid #edf0f4' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(l.id)}
                  onChange={() => handleToggle(l.id)}
                />
                <span>{`${l.last_name} ${l.first_name} ${l.middle_name || ''}`}</span>
                <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '13px' }}>{l.organization_name || '—'}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Выбрано: {selectedIds.length}</span>
          <button onClick={onClose} style={{ background: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Отмена</button>
          <button onClick={handleSubmit} className="btn btn-kiu" disabled={loading || !selectedIds.length}>
            {loading ? 'Добавление...' : 'Добавить'}
          </button>
        </div>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default AddListenersModal;