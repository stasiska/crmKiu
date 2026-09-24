import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../../context/AppContext';
import { createListener, updateListener } from '../../../../api';
import Toast from '../../../../components/Toast';

const ListenerModal = ({ onClose, onSuccess, initialData }) => {
  const isEdit = !!initialData;
  const { users, orgs } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    // При изменении initialData увеличиваем ключ формы, чтобы пересоздать поля
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
      if (isEdit) await updateListener(initialData.id, data);
      else await createListener(data);
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
          {isEdit ? 'Редактировать слушателя' : 'Новый слушатель'}
        </h3>

        <form key={formKey} onSubmit={handleSubmit}>
          <Section title="Основная информация">
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Фамилия *</label>
              <input name="last_name" defaultValue={initialData?.last_name || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Имя *</label>
              <input name="first_name" defaultValue={initialData?.first_name || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Отчество</label>
              <input name="middle_name" defaultValue={initialData?.middle_name || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Дата рождения *</label>
              <input type="date" name="birth_date" defaultValue={initialData?.birth_date || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Пол *</label>
              <select name="gender" defaultValue={initialData?.gender || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }}>
                <option value="">Не выбрано</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Гражданство *</label>
              <input name="citizenship" defaultValue={initialData?.citizenship || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Телефон *</label>
              <input name="phone" defaultValue={initialData?.phone || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Email *</label>
              <input type="email" name="email" defaultValue={initialData?.email || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </Section>

          <Section title="Документы">
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Документ *</label>
              <input name="identity_document" defaultValue={initialData?.identity_document || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Серия документа *</label>
              <input name="document_series" defaultValue={initialData?.document_series || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Номер документа *</label>
              <input name="document_number" defaultValue={initialData?.document_number || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Кем выдан *</label>
              <input name="issued_by" defaultValue={initialData?.issued_by || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>СНИЛС *</label>
              <input name="snils" defaultValue={initialData?.snils || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </Section>

          <Section title="Адреса">
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Адрес проживания *</label>
              <input name="residence_address" defaultValue={initialData?.residence_address || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Адрес регистрации *</label>
              <input name="registration_address" defaultValue={initialData?.registration_address || ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </Section>

          <Section title="Образование">
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Уровень образования</label>
              <select name="education_level" defaultValue={initialData?.education_level || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }}>
                <option value="">Не указано</option>
                <option value="higher">Высшее</option>
                <option value="secondary">СПО</option>
                <option value="basic">Аттестат</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Серия документа об образовании</label>
              <input name="education_series" defaultValue={initialData?.education_series || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Номер документа об образовании</label>
              <input name="education_number" defaultValue={initialData?.education_number || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </Section>

          <Section title="Работа и привязки">
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Организация</label>
              <select name="organization_id" defaultValue={initialData?.organization_id || ''} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }}>
                <option value="">Не выбрано</option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
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

export default ListenerModal;