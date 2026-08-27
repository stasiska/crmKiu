import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/app/mailing');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">
          <div className="login-logo__icon">✉</div>
          <div>
            <h1>CRM КИУ</h1>
            <p>Приложение для автоматизации бизнес задач</p>
          </div>
        </div>
        <div className="login-content">
          <h2>Вход в систему</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d9e0e8' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d9e0e8' }}
              />
            </div>
            {error && <div style={{ color: '#c0392b', marginBottom: '12px' }}>{error}</div>}
            <button type="submit" className="button button--primary" style={{ width: '100%' }}>
              Войти
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;