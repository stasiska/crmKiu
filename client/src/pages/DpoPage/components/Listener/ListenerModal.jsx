import React, { useState, useContext } from 'react';
import { AppContext } from '../../../../context/AppContext';
import { createListener, updateListener } from '../../../../api';
import Toast from '../../../../components/Toast';

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

const ListenerModal = ({ onClose, onSuccess, initialData }) => {
  const isEdit = !!initialData;
  const { orgs } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [sameAddress, setSameAddress] = useState(false);
  const [addresses, setAddresses] = useState(() => ({
    residence_city: initialData?.residence_city || '',
    residence_street: initialData?.residence_street || '',
    residence_house: initialData?.residence_house || '',
    residence_apartment: initialData?.residence_apartment || '',
    registration_city: initialData?.registration_city || '',
    registration_street: initialData?.registration_street || '',
    registration_house: initialData?.registration_house || '',
    registration_apartment: initialData?.registration_apartment || '',
  }));

  const handleAddressCheckbox = (e) => {
    const checked = e.target.checked;
    setSameAddress(checked);

    if (checked) {
      setAddresses((current) => ({
        ...current,
        registration_city: current.residence_city,
        registration_street: current.residence_street,
        registration_house: current.residence_house,
        registration_apartment: current.residence_apartment,
      }));
    }
  };

  const handleAddressChange = (field, value) => {
    setAddresses((current) => {
      const next = { ...current, [field]: value };
      if (sameAddress && field.startsWith('residence_')) {
        next[field.replace('residence_', 'registration_')] = value;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    if (sameAddress) {
      data.registration_city = addresses.residence_city;
      data.registration_street = addresses.residence_street;
      data.registration_house = addresses.residence_house;
      data.registration_apartment = addresses.residence_apartment;
    }
    try {
      if (isEdit) await updateListener(initialData.id, data);
      else await createListener(data);
      onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Неизвестная ошибка';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '800px', background: '#fff', padding: '28px 32px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700 }}>
          {isEdit ? 'Редактировать слушателя' : 'Новый слушатель'}
        </h3>

        <form onSubmit={handleSubmit}>
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
              <input type="date" name="birth_date" defaultValue={initialData?.birth_date ? new Date(initialData.birth_date).toISOString().split('T')[0] : ''} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
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
              <input name="snils" defaultValue={initialData?.snils || ''} required placeholder="XXX-XXX-XXX YY" className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} />
            </div>
          </Section>

          <Section title="Адрес проживания">
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Город *</label>
              <input name="residence_city" value={addresses.residence_city} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} onChange={(e) => handleAddressChange('residence_city', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Улица *</label>
              <input name="residence_street" value={addresses.residence_street} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} onChange={(e) => handleAddressChange('residence_street', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Дом *</label>
              <input name="residence_house" value={addresses.residence_house} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} onChange={(e) => handleAddressChange('residence_house', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Квартира</label>
              <input name="residence_apartment" value={addresses.residence_apartment} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} onChange={(e) => handleAddressChange('residence_apartment', e.target.value)} />
            </div>
          </Section>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={sameAddress} onChange={handleAddressCheckbox} />
              Адрес регистрации совпадает с адресом проживания
            </label>
          </div>

          <Section title="Адрес регистрации">
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Город *</label>
              <input name="registration_city" value={addresses.registration_city} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} disabled={sameAddress} onChange={(e) => handleAddressChange('registration_city', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Улица *</label>
              <input name="registration_street" value={addresses.registration_street} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} disabled={sameAddress} onChange={(e) => handleAddressChange('registration_street', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Дом *</label>
              <input name="registration_house" value={addresses.registration_house} required className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} disabled={sameAddress} onChange={(e) => handleAddressChange('registration_house', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>Квартира</label>
              <input name="registration_apartment" value={addresses.registration_apartment} className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d9e0e8' }} disabled={sameAddress} onChange={(e) => handleAddressChange('registration_apartment', e.target.value)} />
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