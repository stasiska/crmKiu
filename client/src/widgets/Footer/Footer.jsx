import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__content">
        <span>
          © Казанский Инновационный Университет им. В.Г. Тимирясова (ИЭУП)
1994 - 2026 г.
        </span>
        <span className="footer__divider">|</span>
        <span>
          <a href="mailto:ibo-kazan@ieml.ru" className="footer__link">ibo-kazan@ieml.ru</a>
        </span>
        <span className="footer__divider">|</span>
        <span>
          <a href="/privacy" className="footer__link">Политика конфиденциальности</a>
        </span>
        <span className="footer__divider">|</span>
        <span className="footer__dev">
          Разработка: <a href="https://your-dev-site.ru" className="footer__link">Ваша компания</a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;