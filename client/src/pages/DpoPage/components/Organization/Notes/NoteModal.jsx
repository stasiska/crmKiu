import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../../../context/AppContext';
import { createOrganizationNote, updateOrganizationNote } from '../../../../../api';
import Toast from '../../../../../components/Toast';

const NoteModal = ({ organizationId, onClose, onSuccess, initialData }) => {
  const isEdit = !!initialData;
  const { users } = useContext(AppContext);
  const [form, setForm] = useState({
    type: 'note',
    date: '',
    note: '',
    executor_id: '',
    file_link: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        type: initialData.type || 'note',
        date: initialData.date ? initialData.date.split('T')[0] : '',
        note: initialData.note || '',
        executor_id: initialData.executor_id || '',
        file_link: initialData.file_link || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.date) delete payload.date;
      if (isEdit) {
        await updateOrganizationNote(organizationId, initialData.id, payload);
      } else {
        await createOrganizationNote(organizationId, payload);
      }
      onSuccess();
    } catch (err) {
      setToast({ message: 'Ошибка: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '600px', background: '#fff', padding: '24px', borderRadius: '16px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700 }}>
          {isEdit ? 'Редактировать запись' : 'Новая запись'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Тип *</label>
              <select name="type" value={form.type} onChange={handleChange} className="form-control" required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }}>
                <option value="note">Заметка</option>
                <option value="plan">План</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Дата</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Текст *</label>
            <textarea name="note" value={form.note} onChange={handleChange} className="form-control" rows="3" required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Исполнитель</label>
              <select name="executor_id" value={form.executor_id} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }}>
                <option value="">Не выбран</option>
                {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Ссылка на файл</label>
              <input name="file_link" value={form.file_link} onChange={handleChange} placeholder="https://..." className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
            <button type="button" onClick={onClose} style={{ background: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Отмена</button>
            <button type="submit" className="btn btn-kiu" disabled={loading}>{loading ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'}</button>
          </div>
        </form>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default NoteModal;