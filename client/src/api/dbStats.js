import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Создание инстанса axios с базовым URL
const dbStatsApi = axios.create({
  baseURL: API_URL + '/db-stats',
});

// Интерцептор для добавления токена в заголовки
dbStatsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Получение статистики базы данных
export const getDbStats = async () => {
  try {
    const response = await dbStatsApi.get('/');
    return response.data;
  } catch (error) {
    console.error('Ошибка получения статистики базы данных:', error);
    throw error;
  }
};

// Выполнение SQL-запроса
export const executeSqlQuery = async (query) => {
  try {
    const response = await dbStatsApi.post('/execute-query', { query });
    return response.data;
  } catch (error) {
    console.error('Ошибка выполнения SQL-запроса:', error);
    throw error;
  }
};

export default {
  getDbStats,
  executeSqlQuery
};