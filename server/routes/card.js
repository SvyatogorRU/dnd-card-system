const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card');
const authMiddleware = require('../middleware/auth');

// Защита всех маршрутов middleware для проверки авторизации
router.use(authMiddleware);

// Маршруты для управления карточками
router.get('/', cardController.getUserCards);
router.get('/type/:type', cardController.getCardsByType);

// Маршрут для получения использования предмета
router.get('/items/:itemId/usage', cardController.getItemUsage);

router.get('/:cardId', cardController.getCard);
router.post('/', cardController.createCard);
router.put('/:cardId', cardController.updateCard);
router.delete('/:cardId', cardController.deleteCard);

// Маршруты для работы с предметами карточки
router.get('/:cardId/items', cardController.getCardItems);
router.post('/:cardId/items', cardController.addItemToCard);
router.put('/:cardId/items/:itemId', cardController.updateCardItem);
router.delete('/:cardId/items/:itemId', cardController.removeItemFromCard);

module.exports = router;