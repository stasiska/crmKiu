import React, { useState } from 'react';
import { generateListenerContract } from '../../../../api';
import Toast from '../../../../components/Toast';

const ContractGenerationModal = ({ isOpen, onClose, listener, group }) => {
  console.log('ContractGenerationModal render:', { isOpen, listener, group });

  const [formData, setFormData] = useState({
    contract_date: new Date().toISOString().split('T')[0],
    customer_full_name: `${listener.last_name} ${listener.first_name} ${listener.middle_name || ''}`.trim()
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  if (!isOpen) {
    console.log('Modal не отображается, isOpen = false');
    return null;
  }

  if (!group) {
    console.log('Modal не отображается, group не передана');
    return null;
  }

  console.log('Modal отображается!');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const blob = await generateListenerContract(listener.id, {
        ...formData,
        group_id: group.id
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Договор_${listener.last_name}_${new Date().getTime()}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setToast({ message: 'Договор успешно сгенерирован', type: 'success' });
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setToast({ message: 'Ошибка генерации: ' + (err.response?.data?.error || err.message), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '20px' }}>Генерация договора на обучение</h3>

        <div style={{ marginBottom: '20px', padding: '12px', background: '#f3f4f6', borderRadius: '8px', fontSize: '14px' }}>
          <div><strong>Слушатель:</strong> {listener.last_name} {listener.first_name} {listener.middle_name}</div>
          <div><strong>Курс:</strong> {group.course_name}</div>
          <div><strong>Форма обучения:</strong> {group.format}</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                Дата договора <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="date"
                name="contract_date"
                value={formData.contract_date}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                ФИО заказчика <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                name="customer_full_name"
                value={formData.customer_full_name}
                onChange={handleChange}
                required
                placeholder="Иванов Иван Иванович"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                По умолчанию совпадает со слушателем
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-kiu"
              style={{ padding: '8px 16px' }}
            >
              {loading ? 'Генерация...' : 'Сгенерировать'}
            </button>
          </div>
        </form>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default ContractGenerationModal;
