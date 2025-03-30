const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Защита всех маршрутов middleware для проверки авторизации
router.use(authMiddleware);

// Маршруты для управления карточками
router.get('/', cardController.getUserCards);
router.get('/type/:type', cardController.getCardsByType);
router.get('/:cardId', cardController.getCard);
router.post('/', cardController.createCard);
router.put('/:cardId', cardController.updateCard);
router.delete('/:cardId', cardController.deleteCard);

module.exports = router;