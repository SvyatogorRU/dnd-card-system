import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, isAuthenticated, logout as logoutApi } from '../api/auth';

// Создание контекста
export const AuthContext = createContext();

// Хук для использования контекста аутентификации
export const useAuth = () => useContext(AuthContext);

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверка наличия ролей у пользователя
  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.name === roleName);
  };

  // Проверка наличия хотя бы одной из ролей
  const hasAnyRole = (roleNames) => {
    if (!user || !user.roles) return false;
    return roleNames.some(roleName => hasRole(roleName));
  };

  // Загрузка пользователя при инициализации
  useEffect(() => {
    const loadUser = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки пользователя:', err);
        setError('Не удалось загрузить данные пользователя');
        
        // Если токен недействителен, выходим из системы
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          logoutApi();
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Обновление пользователя после входа
  const setAuthUser = (userData) => {
    setUser(userData);
  };

  // Выход из системы
  const logout = () => {
    logoutApi();
    setUser(null);
  };

  // Значения, предоставляемые контекстом
  const value = {
    user,
    setUser: setAuthUser,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isDungeonMaster: hasRole('Dungeon Master'),
    isCardCreator: hasRole('Card Creator'),
    isGroupCaptain: hasRole('Group Captain'),
    hasRole,
    hasAnyRole,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;