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

// Получение всех карточек пользователя
export const getUserCards = async () => {
  try {
    const response = await cardsApi.get('/');
    return response.data;
  } catch (error) {
    console.error('Ошибка получения карточек:', error);
    throw error;
  }
};

// Получение конкретной карточки
export const getCard = async (cardId) => {
  try {
    const response = await cardsApi.get(`/${cardId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения карточки:', error);
    throw error;
  }
};

// Создание новой карточки
export const createCard = async (cardData) => {
  try {
    const response = await cardsApi.post('/', cardData);
    return response.data;
  } catch (error) {
    console.error('Ошибка создания карточки:', error);
    throw error;
  }
};

// Обновление карточки
export const updateCard = async (cardId, cardData) => {
  try {
    const response = await cardsApi.put(`/${cardId}`, cardData);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления карточки:', error);
    throw error;
  }
};

// Удаление карточки
export const deleteCard = async (cardId) => {
  try {
    const response = await cardsApi.delete(`/${cardId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления карточки:', error);
    throw error;
  }
};

export default {
  getUserCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
};