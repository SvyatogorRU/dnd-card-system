const express = require('express');
const router = express.Router();
const dbStatsController = require('../controllers/dbStats');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Защита всех маршрутов middleware для проверки авторизации и прав администратора
router.use(authMiddleware);
router.use(adminMiddleware);

// Маршруты для получения статистики БД
router.get('/', dbStatsController.getDbStats);
router.post('/execute-query', dbStatsController.executeSqlQuery);

module.exports = router;