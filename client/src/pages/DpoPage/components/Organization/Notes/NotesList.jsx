import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../../../context/AppContext';
import { deleteOrganizationNote, fetchOrganizationNotes } from '../../../../../api';
import Toast from '../../../../../components/Toast';
import ConfirmModal from '../../../../../components/ConfirmModal';

const NotesList = ({ organizationId, onEdit }) => {
  const { users } = useContext(AppContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const loadNotes = async () => {
    try {
      const data = await fetchOrganizationNotes(organizationId);
      setNotes(data);
    } catch (err) {
      setToast({ message: 'Ошибка загрузки заметок: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [organizationId]);

  const handleDelete = (id) => {
    setConfirm({
      title: 'Удаление записи',
      message: 'Вы уверены?',
      onConfirm: async () => {
        try {
          await deleteOrganizationNote(organizationId, id);
          setToast({ message: 'Удалено', type: 'success' });
          loadNotes();
        } catch (err) {
          setToast({ message: 'Ошибка: ' + err.message, type: 'error' });
        }
        setConfirm(null);
      },
      onCancel: () => setConfirm(null),
    });
  };

  const formatDate = (date) => date ? new Date(date).toLocaleString('ru-RU') : '—';

  if (loading) return <div>Загрузка заметок...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Всего: {notes.length}</span>
      </div>
      {notes.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Нет заметок и планов</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr>
                <th>Тип</th>
                <th>Дата</th>
                <th>Заметка</th>
                <th>Исполнитель</th>
                <th>Создатель</th>
                <th>Файл</th>
                <th style={{ textAlign: 'center' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => (
                <tr key={n.id}>
                  <td>{n.type === 'note' ? '📝 Заметка' : '📋 План'}</td>
                  <td>{formatDate(n.date || n.created_at)}</td>
                  <td style={{ maxWidth: '250px', wordBreak: 'break-word' }}>{n.note}</td>
                  <td>{n.executor_name || '—'}</td>
                  <td>{n.creator_name || '—'}</td>
                  <td>{n.file_link ? <a href={n.file_link} target="_blank" rel="noopener noreferrer">Ссылка</a> : '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => onEdit(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1557a6' }}>✏️</button>
                    <button onClick={() => handleDelete(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b' }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal {...confirm} />}
    </div>
  );
};

export default NotesList;