import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { createOrganization, updateOrganization } from '../../../api';

const OrganizationModal = ({ onClose, onSuccess, initialData }) => {
  const isEdit = !!initialData;
  const { users } = useContext(AppContext);
  const [form, setForm] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    contact_person: '',
    manager_id: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        address: initialData.address || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        contact_person: initialData.contact_person || '',
        manager_id: initialData.manager_id || '',
        department: initialData.department || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) await updateOrganization(initialData.id, form);
      else await createOrganization(form);
      onSuccess();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '600px', background: '#fff', padding: '24px', borderRadius: '12px' }}>
        <h3>{isEdit ? 'Редактировать организацию' : 'Новая организация'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Название *" required className="form-control" />
            <input name="address" value={form.address} onChange={handleChange} placeholder="Адрес" className="form-control" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="E-mail" className="form-control" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Телефон" className="form-control" />
            <input name="contact_person" value={form.contact_person} onChange={handleChange} placeholder="Контактное лицо" className="form-control" />
            <select name="manager_id" value={form.manager_id} onChange={handleChange} className="form-control">
              <option value="">Менеджер</option>
              {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <input name="department" value={form.department} onChange={handleChange} placeholder="Подразделение" className="form-control" />
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ background: '#e5e7eb', padding: '8px 16px', border: 'none', borderRadius: '6px' }}>Отмена</button>
            <button type="submit" className="btn btn-kiu" disabled={loading}>{loading ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationModal;