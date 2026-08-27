import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside
      className="sidebar"
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        alignSelf: 'flex-start',
      }}
    >
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">✉</div>
        <span>CRM КИУ</span>
      </div>

      <nav className="sidebar__nav">
        <NavLink
          to="/app/mailing"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
          }
        >
          <span className="sidebar__link-icon">✉</span>
          Рассылка
        </NavLink>
        <NavLink
          to="/app/dashboard"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
          }
        >
          <span className="sidebar__link-icon">📋</span>
          Доска задач
        </NavLink>

        <NavLink
          to="/app/notifications"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
          }
        >
          <span className="sidebar__link-icon">🔔</span>
          Уведомления
        </NavLink>

        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
          }
        >
          <span className="sidebar__link-icon">⚙</span>
          Настройки
        </NavLink>

        <div className="sidebar__divider"></div>

        {/* Заглушки */}
        <button className="sidebar__link" disabled>
          <span className="sidebar__link-icon">👥</span>
          Получатели
        </button>
        <button className="sidebar__link" disabled>
          <span className="sidebar__link-icon">📄</span>
          Шаблоны
        </button>
        <button className="sidebar__link" disabled>
          <span className="sidebar__link-icon">📊</span>
          История
        </button>
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__version">CRM v1.0</span>
      </div>
    </aside>
  );
}

export default Sidebar;