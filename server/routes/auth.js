const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

// Тестовый маршрут для проверки
router.get('/check', (req, res) => {
  res.json({ message: 'Auth route is working!' });
});

// Авторизация через Discord
router.post('/discord', authController.discordAuth);

// Получение информации о текущем пользователе
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;