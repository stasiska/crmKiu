import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, fetchMe } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем авторизацию через HttpOnly cookie (без localStorage)
    fetchMe()
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    // Токен теперь в HttpOnly cookie, не сохраняем в localStorage
    setUser(data.user);
    return data;
  };

  const logout = () => {
    // Очищаем только состояние, cookie удалится на сервере
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};