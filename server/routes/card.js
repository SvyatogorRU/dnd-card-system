const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card');
const authMiddleware = require('../middleware/auth');

// Защита всех маршрутов middleware для проверки авторизации
router.use(authMiddleware);

// Маршруты для управления карточками
router.get('/', cardController.getUserCards);
router.get('/:cardId', cardController.getCard);
router.post('/', cardController.createCard);
router.put('/:cardId', cardController.updateCard);
router.delete('/:cardId', cardController.deleteCard);

module.exports = router;