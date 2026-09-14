import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../../context/AppContext';
import { createOrganization, updateOrganization } from '../../../../api';
import Toast from '../../../../components/Toast';

const OrganizationModal = ({ onClose, onSuccess, initialData }) => {
  const isEdit = !!initialData;
  const { users } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    setFormKey(prev => prev + 1);
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    try {
      if (isEdit) await updateOrganization(initialData.id, data);
      else await createOrganization(data);
      onSuccess();
    } catch (err) {
      setToast({ message: 'Ошибка: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', margin: '0 0 10px 0', borderBottom: '2px solid #e5e7eb', paddingBottom: '6px' }}>
        {title}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '800px', background: '#fff', padding: '28px 32px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700 }}>
          {isEdit ? 'Редактировать организацию' : 'Новая организация'}
        </h3>

        <form key={formKey} onSubmit={handleSubmit}>
          <Section title="Основная информация">
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Название *</label>
              <input name="name" defaultValue={initialData?.name || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Адрес</label>
              <input name="address" defaultValue={initialData?.address || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Телефон</label>
              <input name="phone" defaultValue={initialData?.phone || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>E-mail</label>
              <input name="email" defaultValue={initialData?.email || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </Section>

          <Section title="Контакты и лица">
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Контактное лицо</label>
              <input name="contact_person" defaultValue={initialData?.contact_person || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Менеджер</label>
              <select name="manager_id" defaultValue={initialData?.manager_id || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }}>
                <option value="">Не выбран</option>
                {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Подразделение</label>
              <input name="department" defaultValue={initialData?.department || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </Section>

          <Section title="Реквизиты">
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>ОГРН</label>
              <input name="ogrn" defaultValue={initialData?.ogrn || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>ОКПО</label>
              <input name="okpo" defaultValue={initialData?.okpo || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>ОКВЭД</label>
              <input name="okved" defaultValue={initialData?.okved || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>ОКФС</label>
              <input name="okfs" defaultValue={initialData?.okfs || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>ОКОПФ</label>
              <input name="okopf" defaultValue={initialData?.okopf || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>ОКАТО</label>
              <input name="okato" defaultValue={initialData?.okato || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>ИНН</label>
              <input name="inn" defaultValue={initialData?.inn || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>КПП</label>
              <input name="kpp" defaultValue={initialData?.kpp || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </Section>

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

export default OrganizationModal;