import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Создание инстанса axios с базовым URL для админ-операций
const adminApi = axios.create({
  baseURL: API_URL + '/admin',
});

// Создание инстанса axios для пользовательских операций
const userApi = axios.create({
  baseURL: API_URL + '/users',
});

// Интерцептор для добавления токена в заголовки
const addAuthHeader = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

adminApi.interceptors.request.use(addAuthHeader, (error) => Promise.reject(error));
userApi.interceptors.request.use(addAuthHeader, (error) => Promise.reject(error));

// API для полей
export const getAllFields = async (cardType) => {
  try {
    const params = cardType ? { cardType } : {};
    const response = await adminApi.get('/fields', { params });
    return response.data;
  } catch (error) {
    console.error('Ошибка получения полей:', error);
    throw error;
  }
};

export const createField = async (fieldData) => {
  try {
    const response = await adminApi.post('/fields', fieldData);
    return response.data;
  } catch (error) {
    console.error('Ошибка создания поля:', error);
    throw error;
  }
};

export const updateField = async (fieldId, fieldData) => {
  try {
    const response = await adminApi.put(`/fields/${fieldId}`, fieldData);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления поля:', error);
    throw error;
  }
};

export const deleteField = async (fieldId) => {
  try {
    const response = await adminApi.delete(`/fields/${fieldId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления поля:', error);
    throw error;
  }
};

// API для ролей
export const getAllRoles = async () => {
  try {
    const response = await adminApi.get('/roles');
    return response.data;
  } catch (error) {
    console.error('Ошибка получения ролей:', error);
    throw error;
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await adminApi.post('/roles', roleData);
    return response.data;
  } catch (error) {
    console.error('Ошибка создания роли:', error);
    throw error;
  }
};

export const updateRole = async (roleId, roleData) => {
  try {
    const response = await adminApi.put(`/roles/${roleId}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления роли:', error);
    throw error;
  }
};

export const deleteRole = async (roleId) => {
  try {
    const response = await adminApi.delete(`/roles/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления роли:', error);
    throw error;
  }
};

export const assignRoleToUser = async (userId, roleId) => {
  try {
    const response = await adminApi.post('/roles/assign', { userId, roleId });
    return response.data;
  } catch (error) {
    console.error('Ошибка присвоения роли пользователю:', error);
    throw error;
  }
};

export const removeRoleFromUser = async (userId, roleId) => {
  try {
    const response = await adminApi.delete(`/roles/${roleId}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления роли у пользователя:', error);
    throw error;
  }
};

export const getUsersByRole = async (roleId) => {
  try {
    const response = await adminApi.get(`/roles/${roleId}/users`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения пользователей по роли:', error);
    throw error;
  }
};

// API для пользователей
export const getAllUsers = async () => {
  try {
    const response = await userApi.get('/');
    return response.data;
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await userApi.get(`/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await userApi.put(`/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await userApi.get('/profile');
    return response.data;
  } catch (error) {
    console.error('Ошибка получения профиля пользователя:', error);
    throw error;
  }
};

export default {
  // Поля
  getAllFields,
  createField,
  updateField,
  deleteField,
  
  // Роли
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUsersByRole,
  
  // Пользователи
  getAllUsers,
  getUserById,
  updateUser,
  getUserProfile
};