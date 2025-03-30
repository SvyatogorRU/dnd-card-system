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

// Удаление пользователя из группы
export const removeUserFromGroup = async (groupId, userId) => {
  try {
    const response = await groupsApi.delete(`/${groupId}/members/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления пользователя из группы:', error);
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

// Получение предметов группы
export const getGroupItems = async (groupId) => {
  try {
    const response = await groupsApi.get(`/${groupId}/items`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения предметов группы:', error);
    throw error;
  }
};

// Добавление предмета в группу
export const addItemToGroup = async (groupId, itemData) => {
  try {
    const response = await groupsApi.post(`/${groupId}/items`, itemData);
    return response.data;
  } catch (error) {
    console.error('Ошибка добавления предмета в группу:', error);
    throw error;
  }
};

// Удаление предмета из группы
export const removeItemFromGroup = async (groupId, itemId) => {
  try {
    const response = await groupsApi.delete(`/${groupId}/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления предмета из группы:', error);
    throw error;
  }
};

// Получение заметок группы
export const getGroupNotes = async (groupId) => {
  try {
    const response = await groupsApi.get(`/${groupId}/notes`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения заметок группы:', error);
    throw error;
  }
};

// Создание заметки группы
export const createGroupNote = async (groupId, noteData) => {
  try {
    const response = await groupsApi.post(`/${groupId}/notes`, noteData);
    return response.data;
  } catch (error) {
    console.error('Ошибка создания заметки группы:', error);
    throw error;
  }
};

// Обновление заметки группы
export const updateGroupNote = async (groupId, noteId, noteData) => {
  try {
    const response = await groupsApi.put(`/${groupId}/notes/${noteId}`, noteData);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления заметки группы:', error);
    throw error;
  }
};

// Удаление заметки группы
export const deleteGroupNote = async (groupId, noteId) => {
  try {
    const response = await groupsApi.delete(`/${groupId}/notes/${noteId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления заметки группы:', error);
    throw error;
  }
};

// Удаление группы
export const deleteGroup = async (groupId) => {
  try {
    const response = await groupsApi.delete(`/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления группы:', error);
    throw error;
  }
};

// Получение истории хранилища группы
export const getGroupStorageHistory = async (groupId) => {
  try {
    const response = await groupsApi.get(`/${groupId}/storage/history`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения истории хранилища:', error);
    throw error;
  }
};

export default {
  getUserGroups,
  getGroup,
  createGroup,
  updateGroup,
  addUserToGroup,
  removeUserFromGroup,
  getGroupBank,
  updateGroupBank,
  getGroupItems,
  addItemToGroup,
  removeItemFromGroup,
  getGroupNotes,
  createGroupNote,
  updateGroupNote,
  deleteGroupNote,
  deleteGroup,
  getGroupStorageHistory
};