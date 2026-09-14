import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../../context/AppContext';
import { deleteListener, fetchOrganization, fetchOrganizationOptions } from '../../../../api';
import ListenersTable from './ListenersTable';
import ListenerModal from './ListenerModal';
import ListenerCard from './ListenerCard';
import OrganizationCard from '../Organization/OrganizationCard';
import AddListenerToGroupModal from './AddListenerToGroupModal';
import Pagination from '../../../../components/Pagination';
import Toast from '../../../../components/Toast';
import ConfirmModal from '../../../../components/ConfirmModal';
import ListenersFilters from './ListenersFilters';

const ListenersSection = () => {
  const { listeners, loadListeners, listenersLoading, listenersPagination } = useContext(AppContext);
  const [filters, setFilters] = useState({
    search: '',
    organization_id: '',
    gender: '',
    education_level: '',
  });
  const [orgOptions, setOrgOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [editingListener, setEditingListener] = useState(null);
  const [viewingListener, setViewingListener] = useState(null);
  const [viewingOrg, setViewingOrg] = useState(null);
  const [addToGroupListener, setAddToGroupListener] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // Загружаем опции организаций для фильтра
  useEffect(() => {
    fetchOrganizationOptions().then(data => setOrgOptions(data)).catch(() => {});
  }, []);

  useEffect(() => {
    loadListeners({ ...filters, page, limit });
  }, [filters, page, limit]);

  const handleFilterChange = (newFilter) => {
    setFilters(prev => ({ ...prev, ...newFilter }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: '', organization_id: '', gender: '', education_level: '' });
    setPage(1);
  };

  const handleAdd = () => {
    setEditingListener(null);
    setShowModal(true);
  };

  const handleEdit = (listener) => {
    setEditingListener(listener);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setConfirm({
      title: 'Удаление слушателя',
      message: 'Вы уверены?',
      onConfirm: async () => {
        try {
          await deleteListener(id);
          loadListeners({ ...filters, page, limit });
          setToast({ message: 'Удалено', type: 'success' });
        } catch (err) {
          setToast({ message: 'Ошибка: ' + err.message, type: 'error' });
        }
        setConfirm(null);
      },
      onCancel: () => setConfirm(null),
    });
  };

  const handleRowClick = (listener) => {
    setViewingListener(listener);
  };

  const handleOpenOrganization = async (orgId) => {
    if (!orgId) return;
    try {
      const data = await fetchOrganization(orgId);
      setViewingOrg(data);
    } catch (err) {
      setToast({ message: 'Ошибка загрузки организации: ' + err.message, type: 'error' });
    }
  };

  const handleAddToGroup = (listener) => {
    console.log('ListenersSection: handleAddToGroup вызван', listener);
    setAddToGroupListener(listener);
  };

  const totalPages = Math.ceil(listenersPagination.total / listenersPagination.limit) || 1;

  return (
    <div>
      <ListenersFilters
        filters={{ ...filters, orgOptions }}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Найдено: {listenersPagination.total}</span>
        <button onClick={handleAdd} className="btn btn-kiu">+ Добавить слушателя</button>
      </div>

      <ListenersTable
        listeners={listeners}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddToGroup={handleAddToGroup}
        loading={listenersLoading}
      />

      <Pagination
        currentPage={listenersPagination.page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
        limit={listenersPagination.limit}
        onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
      />

      {showModal && (
        <ListenerModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { loadListeners({ ...filters, page, limit }); setShowModal(false); }}
          initialData={editingListener}
        />
      )}

      {viewingListener && (
        <ListenerCard
          listener={viewingListener}
          onClose={() => setViewingListener(null)}
          onEdit={() => { setEditingListener(viewingListener); setViewingListener(null); setShowModal(true); }}
          onDelete={() => handleDelete(viewingListener.id)}
          onOpenOrganization={handleOpenOrganization}
        />
      )}

      {viewingOrg && (
        <OrganizationCard
          organization={viewingOrg}
          onClose={() => setViewingOrg(null)}
        />
      )}

      {addToGroupListener && (
        <AddListenerToGroupModal
          listenerId={addToGroupListener.id}
          listenerName={`${addToGroupListener.last_name} ${addToGroupListener.first_name}`}
          onClose={() => setAddToGroupListener(null)}
          onSuccess={() => {
            setToast({ message: 'Слушатель добавлен в группу', type: 'success' });
            setAddToGroupListener(null);
          }}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal {...confirm} />}
    </div>
  );
};

export default ListenersSection;