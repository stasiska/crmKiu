import React, { useState, useEffect } from 'react';
import { fetchListenerNotes, createListenerNote, updateListenerNote, deleteListenerNote } from '../../../../api';
import Toast from '../../../../components/Toast';
import ConfirmModal from '../../../../components/ConfirmModal';
import './ListenerNotes.css';

const ListenerNotes = ({ listenerId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, note, plan
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const [formData, setFormData] = useState({
    type: 'note',
    date: '',
    note: '',
    executor_id: '',
    file_link: ''
  });

  useEffect(() => {
    loadNotes();
  }, [listenerId, filter]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { type: filter } : {};
      const data = await fetchListenerNotes(listenerId, params);
      setNotes(data.data || []);
    } catch (err) {
      setToast({ message: 'Ошибка загрузки: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'note',
      date: '',
      note: '',
      executor_id: '',
      file_link: ''
    });
    setEditingNote(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingNote) {
        await updateListenerNote(listenerId, editingNote.id, formData);
        setToast({ message: 'Заметка обновлена', type: 'success' });
      } else {
        await createListenerNote(listenerId, formData);
        setToast({ message: 'Заметка создана', type: 'success' });
      }
      resetForm();
      loadNotes();
    } catch (err) {
      setToast({ message: 'Ошибка: ' + err.message, type: 'error' });
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      type: note.type,
      date: note.date ? note.date.split('T')[0] : '',
      note: note.note,
      executor_id: note.executor_id || '',
      file_link: note.file_link || ''
    });
    setShowForm(true);
  };

  const handleDelete = (noteId) => {
    setConfirm({
      title: 'Удаление заметки',
      message: 'Вы уверены, что хотите удалить эту заметку?',
      onConfirm: async () => {
        try {
          await deleteListenerNote(listenerId, noteId);
          setToast({ message: 'Заметка удалена', type: 'success' });
          loadNotes();
        } catch (err) {
          setToast({ message: 'Ошибка: ' + err.message, type: 'error' });
        }
        setConfirm(null);
      },
      onCancel: () => setConfirm(null)
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU');
  };

  return (
    <div className="listener-notes">
      <div className="notes-header">
        <div className="notes-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Все
          </button>
          <button
            className={`filter-btn ${filter === 'note' ? 'active' : ''}`}
            onClick={() => setFilter('note')}
          >
            Заметки
          </button>
          <button
            className={`filter-btn ${filter === 'plan' ? 'active' : ''}`}
            onClick={() => setFilter('plan')}
          >
            Планы
          </button>
        </div>
        <button className="btn btn-kiu" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : '+ Добавить'}
        </button>
      </div>

      {showForm && (
        <form className="note-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Тип</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="note">Заметка</option>
                <option value="plan">План</option>
              </select>
            </div>
            <div className="form-group">
              <label>Дата</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Текст заметки *</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows="4"
              required
              placeholder="Введите текст заметки или плана..."
            />
          </div>

          <div className="form-group">
            <label>Ссылка на файл</label>
            <input
              type="text"
              value={formData.file_link}
              onChange={(e) => setFormData({ ...formData, file_link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Отмена
            </button>
            <button type="submit" className="btn btn-kiu">
              {editingNote ? 'Обновить' : 'Сохранить'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          {filter === 'all' ? 'Нет заметок' : filter === 'note' ? 'Нет заметок' : 'Нет планов'}
        </div>
      ) : (
        <div className="notes-list">
          {notes.map((note) => (
            <div key={note.id} className={`note-item ${note.type}`}>
              <div className="note-header">
                <span className="note-type-badge">{note.type === 'note' ? 'Заметка' : 'План'}</span>
                <span className="note-date">{formatDate(note.date)}</span>
              </div>
              <div className="note-body">
                <p>{note.note}</p>
              </div>
              <div className="note-footer">
                <div className="note-meta">
                  <span>Создал: {note.creator_name || '—'}</span>
                  <span>{formatDateTime(note.created_at)}</span>
                  {note.file_link && (
                    <a href={note.file_link} target="_blank" rel="noopener noreferrer" className="file-link">
                      📎 Файл
                    </a>
                  )}
                </div>
                <div className="note-actions">
                  <button onClick={() => handleEdit(note)} className="icon-btn" title="Редактировать">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="icon-btn delete" title="Удалить">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal {...confirm} />}
    </div>
  );
};

export default ListenerNotes;
