import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../../api';

const UsersManager = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        // обновление только роли и имени (пароль не меняем)
        await updateUser(editingId, {
          name: formData.name,
          role: formData.role
        });
        setSuccess('Пользователь обновлён');
      } else {
        await createUser(formData);
        setSuccess('Пользователь создан');
      }
      setFormData({ email: '', password: '', name: '', role: 'user' });
      setEditingId(null);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      password: '',
      name: user.name || '',
      role: user.role || 'user'
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ email: '', password: '', name: '', role: 'user' });
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Удалить пользователя ${name || id}?`)) return;
    try {
      await deleteUser(id);
      setSuccess('Пользователь удалён');
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const roles = ['user', 'manager', 'admin'];

  return (
    <div>
      <h3>Управление пользователями</h3>
      {error && <div style={{ color: '#c0392b', marginBottom: '10px' }}>{error}</div>}
      {success && <div style={{ color: '#16845b', marginBottom: '10px' }}>{success}</div>}
      <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="form-control" disabled={!!editingId} />
          <input type="text" name="name" placeholder="Имя" value={formData.name} onChange={handleChange} className="form-control" />
          <input type="password" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required={!editingId} className="form-control" />
          <select name="role" value={formData.role} onChange={handleChange} className="form-control">
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button type="submit" className="btn btn-kiu">{editingId ? 'Обновить' : 'Добавить'}</button>
          {editingId && <button type="button" className="btn btn-cancel" onClick={handleCancel} style={{ background: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>Отмена</button>}
        </div>
      </form>
      <div>
        {users.map(u => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <strong>{u.name || u.email}</strong>
              <span style={{ marginLeft: '12px', color: '#6b7280' }}>{u.email}</span>
              <span style={{ marginLeft: '12px', background: '#e5e7eb', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{u.role}</span>
            </div>
            <div>
              {u.id !== currentUser?.id && (
                <>
                  <button onClick={() => handleEdit(u)} style={{ marginRight: '8px', background: 'none', border: 'none', color: '#1557a6', cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => handleDelete(u.id, u.name)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer' }}>🗑</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersManager;