const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Защита всех маршрутов middleware для проверки авторизации и прав администратора
router.use(authMiddleware);
router.use(adminMiddleware);

// Маршруты для управления полями
router.get('/fields', adminController.getAllFields);
router.post('/fields', adminController.createField);
router.put('/fields/:fieldId', adminController.updateField);
router.delete('/fields/:fieldId', adminController.deleteField);

module.exports = router;