import React, { useState, useEffect, useRef } from 'react';
import { fetchGroupListeners, removeListenerFromGroup, updateGroupListener } from '../../../../api';
import AddListenersModal from './AddListenersModal';
import GroupListenerFinanceModal from './GroupListenerFinanceModal';
import Pagination from '../../../../components/Pagination';
import Toast from '../../../../components/Toast';
import ConfirmModal from '../../../../components/ConfirmModal';
import './GroupListenersList.css';

const GroupListenersList = ({ groupId }) => {
  const [listeners, setListeners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [selectedListener, setSelectedListener] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const menuRef = useRef(null);

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

  // Закрытие меню при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRemove = (listenerId, name) => {
    setOpenMenuId(null);
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

  const handleEditFinance = (listener) => {
    setOpenMenuId(null);
    setSelectedListener(listener);
    setShowFinanceModal(true);
  };

  const handleSaveFinance = async (data) => {
    try {
      await updateGroupListener(groupId, selectedListener.id, data);
      setToast({ message: 'Финансовые данные обновлены', type: 'success' });
      setShowFinanceModal(false);
      setSelectedListener(null);
      loadListeners(pagination.page, pagination.limit);
    } catch (err) {
      setToast({ message: 'Ошибка: ' + err.message, type: 'error' });
    }
  };

  const toggleMenu = (listenerId) => {
    setOpenMenuId(openMenuId === listenerId ? null : listenerId);
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
          <table className="table listeners-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Организация</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Сумма по договору</th>
                <th>Оплачено</th>
                <th>Вид оплаты</th>
                <th style={{ textAlign: 'center', width: '60px' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {listeners.map((l) => (
                <tr key={l.id}>
                  <td>{`${l.last_name} ${l.first_name} ${l.middle_name || ''}`}</td>
                  <td>{l.organization_name || '—'}</td>
                  <td>{l.phone || '—'}</td>
                  <td>{l.email || '—'}</td>
                  <td>{l.contract_amount ? `${parseFloat(l.contract_amount).toFixed(2)} ₽` : '—'}</td>
                  <td>{l.paid_amount ? `${parseFloat(l.paid_amount).toFixed(2)} ₽` : '—'}</td>
                  <td>{l.payment_type || '—'}</td>
                  <td style={{ textAlign: 'center', position: 'relative' }}>
                    <button
                      onClick={() => toggleMenu(l.id)}
                      className="menu-toggle-btn"
                      title="Действия"
                    >
                      ⋮
                    </button>
                    {openMenuId === l.id && (
                      <div className="dropdown-menu" ref={menuRef}>
                        <button
                          className="menu-item"
                          onClick={() => handleEditFinance(l)}
                        >
                          <span className="menu-icon">💰</span>
                          Редактировать финансы
                        </button>
                        <button
                          className="menu-item delete"
                          onClick={() => handleRemove(l.id, `${l.last_name} ${l.first_name}`)}
                        >
                          <span className="menu-icon">🗑️</span>
                          Удалить из группы
                        </button>
                      </div>
                    )}
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

      {showFinanceModal && (
        <GroupListenerFinanceModal
          isOpen={showFinanceModal}
          onClose={() => {
            setShowFinanceModal(false);
            setSelectedListener(null);
          }}
          listener={selectedListener}
          onSave={handleSaveFinance}
        />
      )}

      {confirm && <ConfirmModal {...confirm} />}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default GroupListenersList;