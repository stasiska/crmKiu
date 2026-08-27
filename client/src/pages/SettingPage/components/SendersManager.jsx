import React, { useState, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { createSender, updateSender, deleteSender } from '../../../api';

const SendersManager = () => {
  const { senders, loadSenders } = useContext(AppContext);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    host: '',
    port: 465,
    secure: 1,
    password: '',
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', host: '', port: 465, secure: 1, password: '' });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateSender(editingId, formData);
      } else {
        await createSender(formData);
      }
      await loadSenders();
      resetForm();
    } catch (err) {
      alert('Ошибка сохранения: ' + err.message);
    }
  };

  const handleEdit = (sender) => {
    setEditingId(sender.id);
    setFormData({
      name: sender.name,
      email: sender.email,
      host: sender.host,
      port: sender.port,
      secure: sender.secure,
      password: sender.password || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить отправителя?')) return;
    try {
      await deleteSender(id);
      await loadSenders();
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input type="text" name="name" placeholder="Название" value={formData.name} onChange={handleChange} required className="form-control" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="form-control" />
          <input type="text" name="host" placeholder="SMTP хост" value={formData.host} onChange={handleChange} required className="form-control" />
          <input type="number" name="port" placeholder="Порт" value={formData.port} onChange={handleChange} required className="form-control" />
          <select name="secure" value={formData.secure} onChange={handleChange} className="form-control">
            <option value="1">SSL (465)</option>
            <option value="0">TLS (587)</option>
          </select>
          <input type="password" name="password" placeholder="Пароль приложения" value={formData.password} onChange={handleChange} required className="form-control" />
        </div>
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button type="submit" className="btn btn-kiu">{editingId ? 'Обновить' : 'Добавить'}</button>
          {editingId && (
            <button type="button" onClick={resetForm} style={{ background: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Отмена
            </button>
          )}
        </div>
      </form>

      <div>
        {senders.map((s) => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <strong>{s.name}</strong>
              <span style={{ marginLeft: '12px', color: '#6b7280' }}>{s.email}</span>
            </div>
            <div>
              <button onClick={() => handleEdit(s)} style={{ marginRight: '8px', background: 'none', border: 'none', color: '#1557a6', cursor: 'pointer' }}>✏️</button>
              <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer' }}>🗑️</button>
            </div>
          </div>
        ))}
        {senders.length === 0 && <p style={{ color: '#6b7280' }}>Нет отправителей</p>}
      </div>
    </div>
  );
};

export default SendersManager;