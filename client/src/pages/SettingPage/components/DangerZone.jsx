import React, { useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { clearDatabase } from '../../../api';

const DangerZone = () => {
  const { loadRecipients, loadSenders } = useContext(AppContext);

  const handleClear = async () => {
    if (!window.confirm('⚠️ Вы уверены, что хотите удалить всех получателей и историю отправок? Это действие нельзя отменить!')) return;
    if (!window.confirm('Подтвердите ещё раз: удалить все контакты и логи?')) return;
    try {
      await clearDatabase();
      alert('База данных очищена');
      await loadRecipients();
      await loadSenders();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  return (
    <div style={{ marginTop: '40px', padding: '24px', border: '1px solid #f5c6cb', borderRadius: '10px', background: '#fdf2f2' }}>
      <h3 style={{ color: '#c0392b' }}>Опасная зона</h3>
      <p style={{ color: '#6b7280' }}>Очистит всех получателей и историю отправок. Отправители и шаблоны останутся нетронутыми.</p>
      <button onClick={handleClear} style={{ background: '#c0392b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
        🗑️ Очистить базу
      </button>
    </div>
  );
};

export default DangerZone;