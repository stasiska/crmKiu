import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { deleteOrganization } from '../../api';
import OrganizationsTable from './components/OrganizationsTable';
import OrganizationModal from './components/OrganizationModal';
import OrganizationCard from './components/OrganizationCard';

const OrganizationsPage = () => {
  const { orgs, loadOrgs, orgsLoading } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [viewingOrg, setViewingOrg] = useState(null);

  useEffect(() => {
    loadOrgs({ search });
  }, [search]);

  const handleAdd = () => {
    setEditingOrg(null);
    setShowModal(true);
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить организацию?')) return;
    try {
      await deleteOrganization(id);
      loadOrgs({ search });
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleRowClick = (org) => {
    setViewingOrg(org);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Организации</h1>
        <div>
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginRight: '10px', padding: '8px', border: '1px solid #d9e0e8', borderRadius: '6px' }}
          />
          <button onClick={handleAdd} className="btn btn-kiu">+ Добавить организацию</button>
        </div>
      </div>

      <OrganizationsTable
        organizations={orgs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        loading={orgsLoading}
      />

      {showModal && (
        <OrganizationModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { loadOrgs({ search }); setShowModal(false); }}
          initialData={editingOrg}
        />
      )}

      {viewingOrg && (
        <OrganizationCard
          organization={viewingOrg}
          onClose={() => setViewingOrg(null)}
          onEdit={() => { setEditingOrg(viewingOrg); setViewingOrg(null); setShowModal(true); }}
          onDelete={() => { handleDelete(viewingOrg.id); setViewingOrg(null); }}
        />
      )}
    </div>
  );
};

export default OrganizationsPage;