import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Создание инстанса axios с базовым URL
const groupsApi = axios.create({
  baseURL: API_URL + '/groups',
});

// Интерцептор для добавления токена в заголовки
groupsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Получение всех групп пользователя
export const getUserGroups = async () => {
  try {
    const response = await groupsApi.get('/');
    return response.data;
  } catch (error) {
    console.error('Ошибка получения групп:', error);
    throw error;
  }
};

// Получение информации о группе
export const getGroup = async (groupId) => {
  try {
    const response = await groupsApi.get(`/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения группы:', error);
    throw error;
  }
};

// Создание новой группы
export const createGroup = async (groupData) => {
  try {
    const response = await groupsApi.post('/', groupData);
    return response.data;
  } catch (error) {
    console.error('Ошибка создания группы:', error);
    throw error;
  }
};

// Обновление группы
export const updateGroup = async (groupId, groupData) => {
  try {
    const response = await groupsApi.put(`/${groupId}`, groupData);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления группы:', error);
    throw error;
  }
};

// Добавление пользователя в группу
export const addUserToGroup = async (groupId, userData) => {
  try {
    const response = await groupsApi.post(`/${groupId}/members`, userData);
    return response.data;
  } catch (error) {
    console.error('Ошибка добавления пользователя в группу:', error);
    throw error;
  }
};

// Получение истории банка группы
export const getGroupBank = async (groupId) => {
  try {
    const response = await groupsApi.get(`/${groupId}/bank`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения банка группы:', error);
    throw error;
  }
};

// Обновление банка группы
export const updateGroupBank = async (groupId, bankData) => {
  try {
    const response = await groupsApi.post(`/${groupId}/bank`, bankData);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления банка группы:', error);
    throw error;
  }
};

export default {
  getUserGroups,
  getGroup,
  createGroup,
  updateGroup,
  addUserToGroup,
  getGroupBank,
  updateGroupBank
};