import React, { useState } from 'react';
import FormField from '../../../../components/FormField';
import Toast from '../../../../components/Toast';

const ContractGenerationModal = ({ listener, groupId, onClose }) => {
  const [form, setForm] = useState({
    contractNumber: '',
    contractDate: new Date().toISOString().split('T')[0],
    customerFullName: `${listener.last_name || ''} ${listener.first_name || ''} ${listener.middle_name || ''}`.trim(),
    customerPassport: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!form.contractNumber.trim()) {
      setToast({ message: 'Введите номер договора', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/listeners/${listener.id}/documents/contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, groupId }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка генерации');
      }

      // Скачивание файла
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Договор_${listener.last_name}_${form.contractNumber.replace(/\//g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setToast({ message: 'Договор сгенерирован', type: 'success' });
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '600px', background: '#fff', padding: '24px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>
          Генерация договора
        </h3>

        <div style={{ marginBottom: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '14px' }}>
          <strong>Слушатель:</strong> {listener.last_name} {listener.first_name} {listener.middle_name || ''}
        </div>

        <FormField
          label="Номер договора"
          name="contractNumber"
          value={form.contractNumber}
          onChange={handleChange}
          placeholder="Например: ПП-2024/123"
          required
        />

        <FormField
          label="Дата договора"
          name="contractDate"
          type="date"
          value={form.contractDate}
          onChange={handleChange}
          required
        />

        <FormField
          label="ФИО заказчика"
          name="customerFullName"
          value={form.customerFullName}
          onChange={handleChange}
          placeholder="Полное ФИО заказчика"
          hint="По умолчанию совпадает со слушателем"
        />

        <FormField
          label="Паспортные данные заказчика"
          name="customerPassport"
          value={form.customerPassport}
          onChange={handleChange}
          placeholder="Серия, номер, кем и когда выдан"
          hint="Опционально"
        />

        <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: '#e5e7eb',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn btn-kiu"
          >
            {loading ? 'Генерация...' : 'Сгенерировать договор'}
          </button>
        </div>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default ContractGenerationModal;
