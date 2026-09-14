import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../../context/AppContext';
import { createGroup, updateGroup } from '../../../../api';
import Toast from '../../../../components/Toast';

const GroupModal = ({ onClose, onSuccess, initialData }) => {
  const isEdit = !!initialData;
  const { users } = useContext(AppContext);
  const [form, setForm] = useState({
    manager_id: '',
    auditorium: '',
    branch: '',
    course_name: '',
    status: 'набор',
    hours: '',
    start_date: '',
    end_date: '',
    format: 'аудитория',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (initialData) {
      setForm({
        manager_id: initialData.manager_id || '',
        auditorium: initialData.auditorium || '',
        branch: initialData.branch || '',
        course_name: initialData.course_name || '',
        status: initialData.status || 'набор',
        hours: initialData.hours || '',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        format: initialData.format || 'аудитория',
      });
    }
    setFormKey(prev => prev + 1);
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
      if (payload.manager_id === '') delete payload.manager_id;
      if (payload.auditorium === '') delete payload.auditorium;
      if (payload.branch === '') delete payload.branch;
      if (payload.hours === '') delete payload.hours;
      if (payload.start_date === '') delete payload.start_date;
      if (payload.end_date === '') delete payload.end_date;
      if (isEdit) await updateGroup(initialData.id, payload);
      else await createGroup(payload);
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
          {isEdit ? 'Редактировать группу' : 'Новая группа'}
        </h3>

        <form key={formKey} onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Наименование *</label>
            <input name="course_name" value={form.course_name} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Менеджер</label>
              <select name="manager_id" value={form.manager_id} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }}>
                <option value="">Не выбран</option>
                {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Подразделение</label>
              <input name="branch" value={form.branch} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Аудитория</label>
              <input name="auditorium" value={form.auditorium} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Статус</label>
              <select name="status" value={form.status} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }}>
                <option value="набор">Набор</option>
                <option value="открыта">Открыта</option>
                <option value="завершена">Завершена</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Формат</label>
              <select name="format" value={form.format} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }}>
                <option value="аудитория">Аудитория</option>
                <option value="дистант">Дистант</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Часы</label>
              <input name="hours" type="number" min="0" max="9999" value={form.hours} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Дата начала</label>
              <input name="start_date" type="date" value={form.start_date} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Дата окончания</label>
              <input name="end_date" type="date" value={form.end_date} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
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

export default GroupModal;