import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Создание инстанса axios с базовым URL
const cardsApi = axios.create({
  baseURL: API_URL + '/cards',
});

// Интерцептор для добавления токена в заголовки
cardsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Получение предметов карточки
export const getCardItems = async (cardId) => {
  try {
    const response = await cardsApi.get(`/${cardId}/items`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения предметов карточки:', error);
    throw error;
  }
};

// Добавление предмета к карточке
export const addItemToCard = async (cardId, itemData) => {
  try {
    const response = await cardsApi.post(`/${cardId}/items`, itemData);
    return response.data;
  } catch (error) {
    console.error('Ошибка добавления предмета к карточке:', error);
    throw error;
  }
};

// Обновление предмета в карточке
export const updateCardItem = async (cardId, itemId, itemData) => {
  try {
    const response = await cardsApi.put(`/${cardId}/items/${itemId}`, itemData);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления предмета в карточке:', error);
    throw error;
  }
};

// Удаление предмета из карточки
export const removeItemFromCard = async (cardId, itemId) => {
  try {
    const response = await cardsApi.delete(`/${cardId}/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления предмета из карточки:', error);
    throw error;
  }
};

// Получение карточек, в которых используется предмет
export const getItemUsage = async (itemId) => {
  try {
    const response = await cardsApi.get(`/items/${itemId}/usage`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения использования предмета:', error);
    throw error;
  }
};

export default {
  getCardItems,
  addItemToCard,
  updateCardItem,
  removeItemFromCard,
  getItemUsage
};