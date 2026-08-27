import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import SendersList from './components/SendersList';
import ImportArea from './components/ImportArea';
import Filters from './components/Filters';
import RecipientsTable from './components/RecipientsTable';
import EmailForm from './components/EmailForm';
import ProgressLog from './components/ProgressLog';
import ReminderModal from './components/ReminderModal';

const MailingContent = () => {
  const { loading, error } = useContext(AppContext);
  const [remindRecipient, setRemindRecipient] = useState(null);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="text-danger">Ошибка: {error}</div>;

  const handleRemind = (recipient) => {
    setRemindRecipient(recipient);
  };

  const closeReminder = () => {
    setRemindRecipient(null);
  };

  const handleReminderSuccess = () => {
    // можно обновить что-то (пока просто закрываем)
    closeReminder();
  };

  return (
    <div className="mailing-page" style={{ padding: '0', display: 'block' }}>
      {/* КАРТОЧКА 1: Мои почты */}
      <div className="dashboard-card" style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        padding: '24px',
        marginBottom: '20px',
        display: 'block'
      }}>
        <div className="section-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          paddingBottom: '17px',
          borderBottom: '1px solid #edf0f4'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Мои почты</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>Выберите отправителя для рассылки</p>
          </div>
          <span className="section-number" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: '#eaf3ff',
            color: '#1557a6',
            fontSize: '12px',
            fontWeight: 800
          }}>01</span>
        </div>
        <SendersList />
      </div>

      {/* КАРТОЧКА 2: Импорт */}
      <div className="dashboard-card" style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        padding: '24px',
        marginBottom: '20px',
        display: 'block'
      }}>
        <div className="section-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          paddingBottom: '17px',
          borderBottom: '1px solid #edf0f4'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>База получателей</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>Импортируйте контакты из Excel</p>
          </div>
          <span className="section-number" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: '#eaf3ff',
            color: '#1557a6',
            fontSize: '12px',
            fontWeight: 800
          }}>02</span>
        </div>
        <ImportArea />
      </div>

      {/* КАРТОЧКА 3: Фильтры и таблица */}
      <div className="dashboard-card" style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        padding: '24px',
        marginBottom: '20px',
        display: 'block'
      }}>
        <div className="section-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          paddingBottom: '17px',
          borderBottom: '1px solid #edf0f4'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Получатели</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>Фильтрация и выбор контактов для рассылки</p>
          </div>
          <span className="section-number" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: '#eaf3ff',
            color: '#1557a6',
            fontSize: '12px',
            fontWeight: 800
          }}>03</span>
        </div>
        <Filters />
        <RecipientsTable  onRemind={handleRemind}/>
      </div>

      {/* КАРТОЧКА 4: Новая рассылка */}
      <EmailForm />

      {/* КАРТОЧКА 5: Прогресс */}
      <ProgressLog />
      {/* Модальное окно для напоминани */}
    {remindRecipient && (
    <ReminderModal
    recipient={remindRecipient}
    onClose={closeReminder}
    onSuccess={handleReminderSuccess}
      />
    )}
    </div>
  );
};

const MailingPage = () => <MailingContent />;

export default MailingPage;