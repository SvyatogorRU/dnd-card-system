const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/field');
const roleController = require('../controllers/role');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Защита всех маршрутов middleware для проверки авторизации и прав администратора
router.use(authMiddleware);
router.use(adminMiddleware);

// Маршруты для управления полями
router.get('/fields', fieldController.getAllFields);
router.post('/fields', fieldController.createField);
router.put('/fields/:fieldId', fieldController.updateField);
router.delete('/fields/:fieldId', fieldController.deleteField);

// Маршруты для управления ролями
router.get('/roles', roleController.getAllRoles);
router.post('/roles', roleController.createRole);
router.put('/roles/:roleId', roleController.updateRole);
router.delete('/roles/:roleId', roleController.deleteRole);

// Маршруты для управления ролями пользователей
router.post('/roles/assign', roleController.assignRoleToUser);
router.delete('/roles/:roleId/users/:userId', roleController.removeRoleFromUser);
router.get('/roles/:roleId/users', roleController.getUsersByRole);

module.exports = router;