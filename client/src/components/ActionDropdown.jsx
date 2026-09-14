import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

const ActionDropdown = ({ onEdit, onPrint, onAddToGroup, onContract, onInvoice, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef();
  const menuRef = useRef();

  const handleClick = (e) => {
    e.stopPropagation();
    if (!open) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 180;
      const menuHeight = 240; // примерная высота меню (можно увеличить при добавлении пунктов)

      let top = rect.bottom + 5;
      let left = rect.right - menuWidth;

      // Если снизу не помещается — открываем вверх
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 5;
        if (top < 0) top = 5; // если и сверху не помещается, прижимаем к верху
      }

      // Если справа не помещается — смещаем влево
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 5;
      }
      if (left < 0) left = 5;

      setPosition({ top, left });
    }
    setOpen(!open);
  };

  const handleAction = (e, fn) => {
    e.stopPropagation();
    if (fn) fn();
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const menu = open ? ReactDOM.createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        minWidth: '180px',
        zIndex: 9999,
        padding: '4px 0',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => handleAction(e, onEdit)}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 16px',
          border: 'none',
          background: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#1f2937',
        }}
      >
        ✏️ Редактировать
      </button>
      <button
        onClick={(e) => handleAction(e, onPrint)}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 16px',
          border: 'none',
          background: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#1f2937',
        }}
      >
        🖨 Печать
      </button>
      <button
        onClick={(e) => handleAction(e, onAddToGroup)}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 16px',
          border: 'none',
          background: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#1f2937',
        }}
      >
        👥 Добавить в группу
      </button>
      <button
        onClick={(e) => handleAction(e, onContract)}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 16px',
          border: 'none',
          background: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#1f2937',
        }}
      >
        📄 Сформировать договор
      </button>
      <button
        onClick={(e) => handleAction(e, onInvoice)}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 16px',
          border: 'none',
          background: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#1f2937',
        }}
      >
        💳 Выставить счёт
      </button>

      <hr style={{ margin: '4px 8px', border: 'none', borderTop: '1px solid #e5e7eb' }} />

      <button
        onClick={(e) => handleAction(e, onDelete)}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 16px',
          border: 'none',
          background: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#c0392b',
        }}
      >
        🗑 Удалить
      </button>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        style={{
          background: 'none',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '14px',
          cursor: 'pointer',
          color: '#1557a6',
        }}
      >
        ⋯
      </button>
      {menu}
    </>
  );
};

export default ActionDropdown;