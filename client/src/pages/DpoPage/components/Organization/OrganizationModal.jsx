import React, { useState } from 'react';
import { createOrganization, updateOrganization } from '../../../../api';
import Toast from '../../../../components/Toast';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '20px' }}>
    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', margin: '0 0 10px', borderBottom: '2px solid #e5e7eb', paddingBottom: '6px' }}>{title}</h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>{children}</div>
  </div>
);

const Input = ({ label, required = false, ...props }) => (
  <div>
    <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>{label}{required && ' *'}</label>
    <input {...props} required={required} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
  </div>
);

const OrganizationModal = ({ onClose, onSuccess, initialData }) => {
  const isEdit = Boolean(initialData);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const result = isEdit ? await updateOrganization(initialData.id, data) : await createOrganization(data);
      if (result.linkedRecipients > 0) {
        alert(`Автоматически привязано по ИНН: ${result.linkedRecipients} записей рассылки. История синхронизирована.`);
      }
      onSuccess();
    } catch (err) {
      setToast({ message: err.response?.data?.error || err.message || 'Не удалось сохранить организацию', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '800px', background: '#fff', padding: '28px 32px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 700 }}>{isEdit ? 'Редактировать юридическое лицо' : 'Новое юридическое лицо'}</h3>
        <form onSubmit={handleSubmit}>
          <Section title="Наименования и контакты">
            <Input label="Краткое наименование" name="name" defaultValue={initialData?.name || ''} required />
            <Input label="Полное наименование" name="full_name" defaultValue={initialData?.full_name || ''} />
            <Input label="Адрес" name="address" defaultValue={initialData?.address || ''} />
            <Input label="Контактное лицо" name="contact_person" defaultValue={initialData?.contact_person || ''} />
            <Input label="Телефон" name="phone" defaultValue={initialData?.phone || ''} />
            <Input label="E-mail" name="email" type="email" defaultValue={initialData?.email || ''} />
          </Section>

          <Section title="Реквизиты организации">
            <Input label="ИНН организации" name="inn" defaultValue={initialData?.inn || ''} required />
            <Input label="КПП организации" name="kpp" defaultValue={initialData?.kpp || ''} required />
            <Input label="Расчётный счёт" name="settlement_account" defaultValue={initialData?.settlement_account || ''} required />
            <Input label="Наименование банка" name="bank_name" defaultValue={initialData?.bank_name || ''} required />
            <Input label="Корреспондентский счёт" name="correspondent_account" defaultValue={initialData?.correspondent_account || ''} required />
            <Input label="БИК" name="bik" defaultValue={initialData?.bik || ''} required />
            <Input label="ОГРН" name="ogrn" defaultValue={initialData?.ogrn || ''} />
            <Input label="ИНН банка" name="bank_inn" defaultValue={initialData?.bank_inn || ''} />
            <Input label="КПП банка" name="bank_kpp" defaultValue={initialData?.bank_kpp || ''} />
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
