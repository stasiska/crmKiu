import React, { useState, useEffect } from 'react';
import { fetchGroupListeners, removeListenerFromGroup } from '../../../../api';
import AddListenersModal from './AddListenersModal';
import Pagination from '../../../../components/Pagination';
import Toast from '../../../../components/Toast';
import ConfirmModal from '../../../../components/ConfirmModal';

const GroupListenersList = ({ groupId }) => {
  const [listeners, setListeners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const loadListeners = async (page = 1, limit = 20) => {
    try {
      const data = await fetchGroupListeners(groupId, { page, limit });
      setListeners(data.data);
      setPagination({ page: data.page, limit: data.limit, total: data.total });
    } catch (err) {
      setToast({ message: 'Ошибка загрузки: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListeners();
  }, [groupId]);

  const handleRemove = (listenerId, name) => {
    setConfirm({
      title: 'Удаление из группы',
      message: `Удалить ${name} из группы?`,
      onConfirm: async () => {
        try {
          await removeListenerFromGroup(groupId, listenerId);
          setToast({ message: 'Удалено', type: 'success' });
          loadListeners(pagination.page, pagination.limit);
        } catch (err) {
          setToast({ message: 'Ошибка: ' + err.message, type: 'error' });
        }
        setConfirm(null);
      },
      onCancel: () => setConfirm(null),
    });
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    loadListeners(1, pagination.limit);
    setToast({ message: 'Слушатели добавлены', type: 'success' });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Всего: {pagination.total}</span>
        <button onClick={() => setShowAddModal(true)} className="btn btn-kiu">+ Добавить слушателей</button>
      </div>

      {listeners.length === 0 ? (
        <p style={{ color: '#6b7280' }}>В группе нет слушателей</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Организация</th>
                <th>Телефон</th>
                <th>Email</th>
                <th style={{ textAlign: 'center' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {listeners.map((l) => (
                <tr key={l.id}>
                  <td>{`${l.last_name} ${l.first_name} ${l.middle_name || ''}`}</td>
                  <td>{l.organization_name || '—'}</td>
                  <td>{l.phone || '—'}</td>
                  <td>{l.email || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        handleRemove(l.id, `${l.last_name} ${l.first_name}`);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b' }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={pagination.page}
        totalPages={totalPages}
        onPageChange={(newPage) => loadListeners(newPage, pagination.limit)}
        limit={pagination.limit}
        onLimitChange={(newLimit) => loadListeners(1, newLimit)}
      />

      {showAddModal && (
        <AddListenersModal
          groupId={groupId}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {confirm && <ConfirmModal {...confirm} />}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default GroupListenersList;