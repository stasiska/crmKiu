import React, { useState, useEffect, useContext } from 'react';
import { deleteGroup, exportGroups } from '../../../../api';
import GroupsTable from './GroupsTable';
import GroupModal from './GroupModal';
import GroupCard from './GroupCard';
import GroupsFilters from './GroupsFilters';
import Pagination from '../../../../components/Pagination';
import Toast from '../../../../components/Toast';
import ConfirmModal from '../../../../components/ConfirmModal';
import { AppContext } from '../../../../context/AppContext';

const GroupsSection = () => {
  const { groups, loadGroups, groupsLoading, groupsPagination } = useContext(AppContext);
  const [filters, setFilters] = useState({
    search: '',
    manager_id: '',
    status: '',
    format: '',
    hours_min: '',
    hours_max: '',
    page: 1,
    limit: 20
  });
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [viewingGroup, setViewingGroup] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const params = { ...filters };
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) delete params[key];
    });
    loadGroups(params);
  }, [filters]);

  const handleAdd = () => {
    setEditingGroup(null);
    setShowModal(true);
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setShowModal(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = { ...filters };
      delete params.page;
      delete params.limit;
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) delete params[key];
      });
      const blob = await exportGroups(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Группы_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setToast({ message: 'Ошибка выгрузки: ' + (err.response?.data?.error || err.message), type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = (id) => {
    setConfirm({
      title: 'Удаление группы',
      message: 'Вы уверены? Слушатели не будут удалены.',
      onConfirm: async () => {
        try {
          await deleteGroup(id);
          loadGroups({ ...filters });
          setToast({ message: 'Группа удалена', type: 'success' });
        } catch (err) {
          setToast({ message: 'Ошибка: ' + err.message, type: 'error' });
        }
        setConfirm(null);
      },
      onCancel: () => setConfirm(null),
    });
  };

  const handleRowClick = (group) => setViewingGroup(group);
  const totalPages = Math.ceil(groupsPagination.total / groupsPagination.limit) || 1;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Группы</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleExport} className="btn btn-kiu" disabled={exporting}>
            {exporting ? 'Формирование...' : 'Выгрузить в Excel'}
          </button>
          <button onClick={handleAdd} className="btn btn-kiu">+ Создать группу</button>
        </div>
      </div>

      <GroupsFilters filters={filters} onFilterChange={setFilters} />
      <GroupsTable groups={groups} onRowClick={handleRowClick} onEdit={handleEdit} onDelete={handleDelete} loading={groupsLoading} />

      <Pagination
        currentPage={groupsPagination.page}
        totalPages={totalPages}
        onPageChange={(newPage) => setFilters(prev => ({ ...prev, page: newPage }))}
        limit={groupsPagination.limit}
        onLimitChange={(newLimit) => setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }))}
      />

      {showModal && (
        <GroupModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { loadGroups({ ...filters }); setShowModal(false); }}
          initialData={editingGroup}
        />
      )}

      {viewingGroup && (
        <GroupCard
          group={viewingGroup}
          onClose={() => setViewingGroup(null)}
          onEdit={() => { setEditingGroup(viewingGroup); setViewingGroup(null); setShowModal(true); }}
          onDelete={() => handleDelete(viewingGroup.id)}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal {...confirm} />}
    </div>
  );
};

export default GroupsSection;
