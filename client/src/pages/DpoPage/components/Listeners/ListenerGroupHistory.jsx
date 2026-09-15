import React, { useState, useEffect } from 'react';
import { fetchListenerGroupHistory } from '../../../../api';
import './ListenerGroupHistory.css';

const ListenerGroupHistory = ({ listenerId }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchListenerGroupHistory(listenerId);
        setGroups(data.data || []);
      } catch (err) {
        console.error('Ошибка загрузки истории групп:', err);
      } finally {
        setLoading(false);
      }
    };

    if (listenerId) {
      loadHistory();
    }
  }, [listenerId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
  };

  const formatAmount = (amount) => {
    if (!amount) return '—';
    return `${parseFloat(amount).toFixed(2)} ₽`;
  };

  if (loading) {
    return <div className="loading">Загрузка истории...</div>;
  }

  if (groups.length === 0) {
    return <div className="empty-state">Слушатель еще не участвовал в группах</div>;
  }

  return (
    <div className="listener-group-history">
      <h3>История групп обучения</h3>
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Название курса</th>
              <th>Дата начала</th>
              <th>Дата окончания</th>
              <th>Вид оплаты</th>
              <th>Сумма по договору</th>
              <th>Оплачено</th>
              <th>Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id}>
                <td className="course-name">{group.course_name}</td>
                <td>{formatDate(group.start_date)}</td>
                <td>{formatDate(group.end_date)}</td>
                <td>{group.payment_type || '—'}</td>
                <td className="amount">{formatAmount(group.contract_amount)}</td>
                <td className="amount">{formatAmount(group.paid_amount)}</td>
                <td className="comment">{group.comment || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListenerGroupHistory;
