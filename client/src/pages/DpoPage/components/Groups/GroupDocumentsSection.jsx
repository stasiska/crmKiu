import { useState, useEffect } from 'react';
import Toast from '../../../../components/Toast';

export default function GroupDocumentsSection({ groupId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [groupId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/documents`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки документов');
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/documents/${documentId}/download`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки документа');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Удалить документ?')) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления документа');
      }

      setToast({ message: 'Документ удалён', type: 'success' });
      fetchDocuments();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>;
  }

  if (documents.length === 0) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        color: '#6b7280',
        background: '#f9fafb',
        borderRadius: '8px'
      }}>
        Документы отсутствуют. Нажмите "Сформировать приказ" для создания документа.
      </div>
    );
  }

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '14px' }}>Тип документа</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '14px' }}>Файл</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '14px' }}>Создан</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '14px' }}>Автор</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '14px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', fontSize: '14px' }}>{doc.document_type}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#3b82f6' }}>
                  <button
                    onClick={() => handleDownload(doc.id, doc.filename)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {doc.filename}
                  </button>
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                  {new Date(doc.created_at).toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                  {doc.creator_name || '—'}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleDownload(doc.id, doc.filename)}
                      style={{
                        padding: '6px 12px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                      title="Скачать"
                    >
                      📥 Скачать
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                      title="Удалить"
                    >
                      🗑 Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
}
