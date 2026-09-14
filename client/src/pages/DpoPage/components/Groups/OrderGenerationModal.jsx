import { useState } from 'react';
import FormField from '../../../../components/FormField';
import Toast from '../../../../components/Toast';

export default function OrderGenerationModal({ groupId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    templateType: 'enrollment_order',
    orderNumber: '',
    deputyDirectorName: 'Н.Г. Сидоров'
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!form.orderNumber.trim()) {
      setToast({ message: 'Введите номер приказа', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/documents/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
      a.download = `order_${form.templateType}_${form.orderNumber.replace(/\//g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setToast({ message: 'Документ сгенерирован', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAttach = async () => {
    if (!form.orderNumber.trim()) {
      setToast({ message: 'Введите номер приказа', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/documents/attach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка прикрепления');
      }

      setToast({ message: 'Приказ прикреплён к группе', type: 'success' });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      let documentType;
      switch (form.templateType) {
        case 'enrollment_order':
          documentType = 'Приказ о зачислении';
          break;
        case 'diploma_order':
          documentType = 'Приказ о выдаче документов';
          break;
        case 'diploma_order_kazan':
          documentType = 'Приказ о выдаче документов (Казань)';
          break;
        default:
          documentType = 'Документ';
      }

      formData.append('document_type', documentType);

      const response = await fetch(`/api/groups/${groupId}/documents/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка загрузки');
      }

      setToast({ message: 'Документ загружен', type: 'success' });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Формирование приказа</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <div className="modal-body">
            <FormField label="Тип приказа">
              <select name="templateType" value={form.templateType} onChange={handleChange}>
                <option value="enrollment_order">О зачислении</option>
                <option value="diploma_order">О выдаче документов</option>
                <option value="diploma_order_kazan">О выдаче документов (Казань)</option>
              </select>
            </FormField>

            <FormField label="Номер приказа" required>
              <input
                type="text"
                name="orderNumber"
                value={form.orderNumber}
                onChange={handleChange}
                placeholder="Например: ПП 146/1/2026"
              />
            </FormField>

            {form.templateType === 'diploma_order' && (
              <FormField label="ФИО заместителя директора">
                <input
                  type="text"
                  name="deputyDirectorName"
                  value={form.deputyDirectorName}
                  onChange={handleChange}
                  placeholder="Н.Г. Сидоров"
                />
              </FormField>
            )}

            <div className="button-group">
              <button
                className="btn btn-secondary"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Генерация...' : 'Сгенерировать и посмотреть'}
              </button>

              <button
                className="btn btn-primary"
                onClick={handleAttach}
                disabled={loading}
              >
                {loading ? 'Сохранение...' : 'Прикрепить к группе'}
              </button>

              <label className="btn btn-outline">
                Загрузить свой вариант
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #374151;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-secondary {
          background: #10b981;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #059669;
        }

        .btn-outline {
          background: white;
          color: #3b82f6;
          border: 1px solid #3b82f6;
          text-align: center;
        }

        .btn-outline:hover:not(:disabled) {
          background: #eff6ff;
        }
      `}</style>
    </>
  );
}
