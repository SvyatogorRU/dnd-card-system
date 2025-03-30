// src/api/admin.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Создание инстанса axios с базовым URL
const adminApi = axios.create({
  baseURL: API_URL + '/admin',
});

// Интерцептор для добавления токена в заголовки
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Получение всех полей
export const getAllFields = async () => {
  try {
    const response = await adminApi.get('/fields');
    return response.data;
  } catch (error) {
    console.error('Ошибка получения полей:', error);
    throw error;
  }
};

// Создание нового поля
export const createField = async (fieldData) => {
  try {
    // Убедимся, что у данных есть ключ
    if (!fieldData.key && fieldData.name) {
      fieldData.key = fieldData.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    }
    
    // Добавим значения по умолчанию
    const enrichedData = {
      options: [],
      required: false,
      order: 0,
      ...fieldData
    };
    
    console.log('Отправляемые данные для создания поля:', enrichedData);
    
    const response = await adminApi.post('/fields', enrichedData);
    return response.data;
  } catch (error) {
    console.error('Детали ошибки создания поля:', error.response?.data || error.message);
    throw error;
  }
};

// Обновление поля
export const updateField = async (fieldId, fieldData) => {
  try {
    // Убедимся, что у данных есть ключ при обновлении имени
    if (!fieldData.key && fieldData.name && (!fieldData._id || fieldData._id === fieldId)) {
      fieldData.key = fieldData.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    }
    
    console.log('Отправляемые данные для обновления поля:', fieldData);
    
    const response = await adminApi.put(`/fields/${fieldId}`, fieldData);
    return response.data;
  } catch (error) {
    console.error('Детали ошибки обновления поля:', error.response?.data || error.message);
    throw error;
  }
};

// Удаление поля
export const deleteField = async (fieldId) => {
  try {
    const response = await adminApi.delete(`/fields/${fieldId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления поля:', error);
    throw error;
  }
};

export default {
  getAllFields,
  createField,
  updateField,
  deleteField,
};