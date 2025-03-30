// src/api/auth.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Создание инстанса axios с базовым URL
const authApi = axios.create({
  baseURL: API_URL + '/auth',
});

// Интерцептор для добавления токена в заголовки
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Получение URL для авторизации через Discord
export const getDiscordAuthUrl = () => {
  const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_DISCORD_REDIRECT_URI;
  const scope = 'identify';
  
  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
};

// Авторизация через Discord
export const loginWithDiscord = async (code) => {
  try {
    const response = await authApi.post('/discord', { code });
    const { token, user } = response.data;
    
    // Сохраняем токен и информацию о пользователе
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  } catch (error) {
    console.error('Ошибка авторизации через Discord:', error);
    throw error;
  }
};

// Получение информации о текущем пользователе
export const getCurrentUser = async () => {
  try {
    const response = await authApi.get('/me');
    return response.data;
  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    throw error;
  }
};

// Выход из системы
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Проверка аутентификации
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export default {
  getDiscordAuthUrl,
  loginWithDiscord,
  getCurrentUser,
  logout,
  isAuthenticated,
};