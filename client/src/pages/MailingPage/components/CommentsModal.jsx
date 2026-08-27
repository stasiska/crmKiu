import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchComments, addComment } from '../../../api';

const CommentsModal = ({ recipient, onClose }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadComments = async () => {
    try {
      const data = await fetchComments(recipient.id);
      setComments(data);
    } catch (err) {
      console.error('Ошибка загрузки комментариев:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [recipient.id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSending(true);
    try {
      await addComment(recipient.id, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div style={{ background: 'white', borderRadius: '12px', maxWidth: '600px', width: '100%', padding: '24px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>📝 История комментариев</h3>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{recipient.email}</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка...</div>
          ) : comments.length === 0 ? (
            <div style={{ color: '#6b7280', textAlign: 'center' }}>Нет комментариев</div>
          ) : (
            comments.map(c => (
              <div key={c.id} style={{ borderBottom: '1px solid #edf0f4', padding: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563' }}>
                  <strong>{c.author_name || 'Пользователь'}</strong>
                  <span>{formatDate(c.created_at)}</span>
                </div>
                <div style={{ marginTop: '4px', fontSize: '14px', color: '#1f2937' }}>{c.comment}</div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Добавить комментарий..."
            className="form-control"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-kiu" disabled={sending || !newComment.trim()}>
            {sending ? 'Отправка...' : 'Добавить'}
          </button>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Закрыть
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentsModal;