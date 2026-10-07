import React, { useEffect, useState } from 'react';
import { createOrganization, updateOrganization } from '../../../api';

const INITIAL_FORM = {
  name: '',
  full_name: '',
  address: '',
  email: '',
  phone: '',
  contact_person: '',
  inn: '',
  kpp: '',
  settlement_account: '',
  bank_name: '',
  correspondent_account: '',
  bik: '',
  ogrn: '',
  bank_inn: '',
  bank_kpp: '',
};

const OrganizationModal = ({ onClose, onSuccess, initialData }) => {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initialData ? { ...INITIAL_FORM, ...initialData } : INITIAL_FORM);
  }, [initialData]);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = isEdit ? await updateOrganization(initialData.id, form) : await createOrganization(form);
      if (result.linkedRecipients > 0) {
        alert(`Автоматически привязано по ИНН: ${result.linkedRecipients} записей рассылки. История синхронизирована.`);
      }
      onSuccess();
    } catch (err) {
      alert('Ошибка: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const input = (name, placeholder, required = false, type = 'text') => (
    <input name={name} type={type} value={form[name] || ''} onChange={handleChange} placeholder={`${placeholder}${required ? ' *' : ''}`} required={required} className="form-control" />
  );

  return (
    <div className="modal-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '720px', background: '#fff', padding: '24px', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>{isEdit ? 'Редактировать юридическое лицо' : 'Новое юридическое лицо'}</h3>
        <form onSubmit={handleSubmit}>
          <h4>Наименования и контакты</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {input('name', 'Краткое наименование', true)}
            {input('full_name', 'Полное наименование')}
            {input('address', 'Адрес')}
            {input('contact_person', 'Контактное лицо')}
            {input('email', 'E-mail', false, 'email')}
            {input('phone', 'Телефон')}
          </div>

          <h4 style={{ marginTop: '20px' }}>Реквизиты организации</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {input('inn', 'ИНН организации', true)}
            {input('kpp', 'КПП организации', true)}
            {input('settlement_account', 'Расчётный счёт', true)}
            {input('bank_name', 'Наименование банка', true)}
            {input('correspondent_account', 'Корреспондентский счёт', true)}
            {input('bik', 'БИК', true)}
            {input('ogrn', 'ОГРН')}
            {input('bank_inn', 'ИНН банка')}
            {input('bank_kpp', 'КПП банка')}
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
