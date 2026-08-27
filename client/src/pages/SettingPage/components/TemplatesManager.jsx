import React, { useState, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { createTemplate, updateTemplate, deleteTemplate } from '../../../api';

const TemplatesManager = () => {
  const { templates, loadTemplates } = useContext(AppContext);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
  });

  const resetForm = () => {
    setFormData({ name: '', subject: '', body: '' });
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
        await updateTemplate(editingId, formData);
      } else {
        await createTemplate(formData);
      }
      await loadTemplates();
      resetForm();
    } catch (err) {
      alert('Ошибка сохранения: ' + err.message);
    }
  };

  const handleEdit = (tpl) => {
    setEditingId(tpl.id);
    setFormData({
      name: tpl.name,
      subject: tpl.subject,
      body: tpl.body,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить шаблон?')) return;
    try {
      await deleteTemplate(id);
      await loadTemplates();
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" name="name" placeholder="Название шаблона" value={formData.name} onChange={handleChange} required className="form-control" />
          <input type="text" name="subject" placeholder="Тема" value={formData.subject} onChange={handleChange} required className="form-control" />
          <textarea name="body" placeholder="HTML-код письма" rows="5" value={formData.body} onChange={handleChange} required className="form-control" />
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
        {templates.map((t) => (
          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <strong>{t.name}</strong>
              <span style={{ marginLeft: '12px', color: '#6b7280' }}>{t.subject}</span>
            </div>
            <div>
              <button onClick={() => handleEdit(t)} style={{ marginRight: '8px', background: 'none', border: 'none', color: '#1557a6', cursor: 'pointer' }}>✏️</button>
              <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer' }}>🗑️</button>
            </div>
          </div>
        ))}
        {templates.length === 0 && <p style={{ color: '#6b7280' }}>Нет шаблонов</p>}
      </div>
    </div>
  );
};

export default TemplatesManager;