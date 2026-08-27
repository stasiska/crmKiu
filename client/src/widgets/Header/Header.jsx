import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { fetchUnreadTotal } from '../../api'; // новый импорт

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadTotal, setUnreadTotal] = useState(0);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/app/mailing':
        return { title: 'Рассылка', subtitle: 'Управление email-рассылками' };
      case '/app/settings':
        return { title: 'Настройки', subtitle: 'Управление отправителями и шаблонами' };
      case '/app/notifications':
        return { title: 'Уведомления', subtitle: 'Все напоминания и оповещения' };
      default:
        return { title: 'CRM', subtitle: 'Управление клиентами' };
    }
  };

  const { title, subtitle } = getPageTitle();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetchUnreadTotal();
        setUnreadTotal(res.total);
      } catch (e) {
        // игнорируем
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 13000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div className="header__content">
        <div>
          <h1 className="header__title">{title}</h1>
          <p className="header__subtitle">{subtitle}</p>
        </div>
        <div className="header__actions">
          <Link to="/app/notifications" className="header__settings" style={{ textDecoration: 'none', position: 'relative' }}>
            🔔
            {unreadTotal > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  background: '#c0392b',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
              >
                {unreadTotal}
              </span>
            )}
          </Link>
          <Link to="/app/settings" className="header__settings" style={{ textDecoration: 'none' }}>⚙</Link>
          <div className="header__user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>{user?.name || 'Пользователь'}</span>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer' }}>
              Выйти
            </button>
            <div className="header__avatar">{user?.name?.[0] || 'A'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;