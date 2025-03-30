const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Защита маршрутов middleware для проверки авторизации
router.use(authMiddleware);

// Маршрут для получения профиля текущего пользователя
router.get('/profile', userController.getProfile);

// Маршруты, доступные только администраторам
router.get('/', adminMiddleware, userController.getAllUsers);
router.get('/:userId', adminMiddleware, userController.getUserById);
router.put('/:userId', adminMiddleware, userController.updateUser);

module.exports = router;