import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../../context/AppContext';
import { deleteOrganization } from '../../../../api';
import OrganizationsTable from './OrganizationsTable';
import OrganizationModal from './OrganizationModal';
import OrganizationCard from './OrganizationCard';
import Pagination from '../../../../components/Pagination';
import Toast from '../../../../components/Toast';
import ConfirmModal from '../../../../components/ConfirmModal';

const OrganizationsSection = () => {
  const { orgs, loadOrgs, orgsLoading, orgsPagination } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [viewingOrg, setViewingOrg] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    loadOrgs({ search, page, limit });
  }, [search, page, limit]);

  const handleAdd = () => {
    setEditingOrg(null);
    setShowModal(true);
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setConfirm({
      title: 'Удаление организации',
      message: 'Вы уверены, что хотите удалить эту организацию?',
      onConfirm: async () => {
        try {
          await deleteOrganization(id);
          loadOrgs({ search, page, limit });
          setToast({ message: 'Организация удалена', type: 'success' });
        } catch (err) {
          setToast({ message: 'Ошибка: ' + err.message, type: 'error' });
        }
        setConfirm(null);
      },
      onCancel: () => setConfirm(null),
    });
  };

  const handleRowClick = (org) => {
    setViewingOrg(org);
  };

  const totalPages = Math.ceil(orgsPagination.total / orgsPagination.limit) || 1;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Поиск организаций..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ padding: '8px', border: '1px solid #d9e0e8', borderRadius: '6px', width: '300px' }}
        />
        <button onClick={handleAdd} className="btn btn-kiu">+ Добавить организацию</button>
      </div>

      <OrganizationsTable
        organizations={orgs}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={orgsLoading}
      />

      <Pagination
        currentPage={orgsPagination.page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
        limit={orgsPagination.limit}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      {showModal && (
        <OrganizationModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { loadOrgs({ search, page, limit }); setShowModal(false); }}
          initialData={editingOrg}
        />
      )}

      {viewingOrg && (
        <OrganizationCard
          organization={viewingOrg}
          onClose={() => setViewingOrg(null)}
          onEdit={() => { setEditingOrg(viewingOrg); setViewingOrg(null); setShowModal(true); }}
          onDelete={() => handleDelete(viewingOrg.id)}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal {...confirm} />}
    </div>
  );
};

export default OrganizationsSection;