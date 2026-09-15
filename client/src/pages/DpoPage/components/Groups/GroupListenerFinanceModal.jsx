import React, { useState, useEffect } from 'react';
import './GroupListenerFinanceModal.css';

const GroupListenerFinanceModal = ({ isOpen, onClose, listener, onSave }) => {
  const [formData, setFormData] = useState({
    contract_amount: '',
    paid_amount: '',
    payment_type: '',
    comment: ''
  });

  useEffect(() => {
    if (listener) {
      setFormData({
        contract_amount: listener.contract_amount || '',
        paid_amount: listener.paid_amount || '',
        payment_type: listener.payment_type || '',
        comment: listener.listener_comment || ''
      });
    }
  }, [listener]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSave = {
      contract_amount: formData.contract_amount ? parseFloat(formData.contract_amount) : null,
      paid_amount: formData.paid_amount ? parseFloat(formData.paid_amount) : null,
      payment_type: formData.payment_type || null,
      comment: formData.comment || null
    };

    onSave(dataToSave);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Финансовые данные</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="listener-info">
            <strong>{listener?.last_name} {listener?.first_name} {listener?.middle_name}</strong>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Сумма по договору</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.contract_amount}
                onChange={(e) => handleChange('contract_amount', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Оплачено</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.paid_amount}
                onChange={(e) => handleChange('paid_amount', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Вид оплаты</label>
              <select
                value={formData.payment_type}
                onChange={(e) => handleChange('payment_type', e.target.value)}
              >
                <option value="">Не указан</option>
                <option value="физлицо">Физлицо</option>
                <option value="организация">Организация</option>
                <option value="бюджет">Бюджет</option>
                <option value="прочее">Прочее</option>
              </select>
            </div>

            <div className="form-group">
              <label>Комментарий</label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleChange('comment', e.target.value)}
                rows="3"
                placeholder="Дополнительная информация"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Отмена
              </button>
              <button type="submit" className="btn-primary">
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupListenerFinanceModal;
